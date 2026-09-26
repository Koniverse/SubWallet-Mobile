import EventEmitter from 'eventemitter3';
import React from 'react';
import WebView from 'react-native-webview';
import StaticServer, { STATES } from '@dr.pogodin/react-native-static-server';
import { WebRunnerState, WebRunnerStatus } from 'providers/contexts';
import { AppState, AppStateStatus, DeviceEventEmitter, NativeSyntheticEvent, Platform } from 'react-native';
import { getId } from '@subwallet/extension-base/utils/getId';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { getDevMode, mmkvStore, restoreStorageData, triggerBackupOnInit } from 'utils/storage';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import {
  ACCEPTABLE_RESPONSE_TIME,
  INTERNAL_MESSAGE_IDS,
  LONG_TIMEOUT,
  NEED_UPDATE_CHROME,
  WEB_SERVER_PORT,
} from 'providers/WebRunnerProvider/constant';
import { listenMessage, restartAllHandlers } from 'messaging/base';
import { Message } from '@subwallet/extension-base/types';
import { notifyUnstable } from 'providers/WebRunnerProvider/nofifyUnstable';
import { copyAndroidWebBundle } from 'providers/WebRunnerProvider/androidWebBundle';
import { WEBVIEW_ANDROID_SYSTEM_MIN_VERSION } from 'constants/index';
export interface WebRunnerGlobalState {
  uri?: string;
  injectScript: string;
  runnerRef: React.RefObject<WebView<{}> | undefined>;
  stateRef: React.RefObject<WebRunnerState>;
  eventEmitter: EventEmitter;
}

interface WebRunnerControlAction {
  type: string;
  payload?: Partial<WebRunnerGlobalState>;
}

export const isWebRunnerAlive = (
  eventData: NativeSyntheticEvent<any>,
): boolean => {
  try {
    const data = JSON.parse(eventData.nativeEvent.data);
    return (
      !!data.id &&
      !INTERNAL_MESSAGE_IDS.includes(data.id) &&
      (data.response !== undefined || data.subscription !== undefined)
    );
  } catch {
    return false;
  }
};

const isFirstLaunch = mmkvStore.getAllKeys().length === 0;
const storedCompleteBackUpData = mmkvStore.getBoolean('backup-data-for-android');

const completeBackUpData = !isFirstLaunch ? storedCompleteBackUpData : true;
const isDevMode = getDevMode();
let server: StaticServer | null = null;
let started = false;
let serverReadyPromise: Promise<boolean> | null = null;
// Module scope like the rest of the runner's state, and for the same reason: the thing being
// repaired is the one native server of this process, so a repair is global, not per instance.
let isRecovering = false;

const SERVER_ORIGIN = `http://localhost:${WEB_SERVER_PORT}`;
const SERVER_START_MAX_ATTEMPTS = 6;
const LOAD_FAILURE_MAX_RECOVERIES = 5;

/**
 * Does anything actually answer on the runner's port?
 *
 * The only honest way to tell a live server from a dead one: the native module's own bookkeeping
 * survives a JS reload (iOS keeps the process), so `started`/`server` can describe a lighttpd that
 * another JS context has since shut down.
 */
const isStaticServerReachable = async (timeoutMs = 2000): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${SERVER_ORIGIN}/index.html?probe=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });

    return response.ok;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * stop() that cannot hang. A CRASHED instance returns early on the JS side, and the iOS native
 * stop has no else-branch when its server ivar is nil - its promise then never settles at all.
 */
const safeStopServer = async (instance: StaticServer | null, timeoutMs = 5000) => {
  if (!instance || instance.state !== STATES.ACTIVE) {
    return;
  }

  await Promise.race([
    instance.stop('webrunner-restart').catch(() => undefined),
    new Promise(resolve => setTimeout(resolve, timeoutMs)),
  ]);
};

/**
 * Hand the next JS context a free port. On iOS RNRestart.Restart() keeps the unix process alive,
 * so without this the new context boots on top of a still-registered lighttpd: its start() fails
 * with 'Another Server instance is active' while this context's teardown shuts that very server
 * down, and the app is left pointing at a dead origin with `started` latched true.
 */
export const stopStaticServerForRestart = async (timeoutMs = 5000) => {
  const current = server;

  server = null;
  started = false;
  serverReadyPromise = null;

  await safeStopServer(current, timeoutMs);
};

/**
 * Is the handler actually working on the runner right now - starting the server, retry chain
 * included, or repairing it?
 *
 * App.tsx asks this before it replaces the spinner with the recovery panel. A first launch on a
 * slow device can legitimately spend the better part of a minute inside the start retries, and a
 * panel announcing that the app is stuck while it is visibly still trying is alarming for nothing.
 * Sitting in a backoff between chains deliberately does not count: a chain that keeps failing
 * would otherwise suppress the panel forever, and that is the one case that needs it.
 */
export const isRunnerStartupInFlight = () => serverReadyPromise !== null || isRecovering;

export class WebRunnerHandler {
  eventEmitter?: EventEmitter;
  webRef?: React.RefObject<WebView<{}> | undefined>;
  state?: WebRunnerGlobalState;
  runnerState: WebRunnerState = {};
  lastTimeResponse?: number;
  lastActiveTime?: number;
  pingTimeout?: NodeJS.Timeout;
  outOfResponseTimeTimeout?: NodeJS.Timeout;
  pingInterval?: NodeJS.Timeout;
  resumePingTimeout?: NodeJS.Timeout;
  status: 'inactive' | 'activating' | 'active' = 'inactive';
  dispatch?: React.Dispatch<WebRunnerControlAction>;
  shouldReloadHandler: boolean = false;
  isBackupOnInit = false;
  androidBundleReadyPromise: Promise<void> = Promise.resolve();
  activateRetryTimeout?: NodeJS.Timeout;
  activateAttempts = 0;
  readyWatchdog?: NodeJS.Timeout;
  recoveryAttempts = 0;
  loadFailureCount = 0;

  constructor() {
    if (Platform.OS === 'android') {
      if (completeBackUpData) {
        this.androidBundleReadyPromise = this.prepareAndroidBundle();
      }
    }

    AppState.addEventListener('change', this.onAppStateChange);
  }

  private async prepareAndroidBundle() {
    const BUNDLE_PATH = isDevMode ? 'DevModeWeb.bundle' : 'Web.bundle';
    const ANDROID_BUNDLE_PATH = `${RNFS.DocumentDirectoryPath}/${BUNDLE_PATH}/site`;
    try {
      // Decide by comparing the shipped files with the copy on disk, not by app
      // version. index.html names the content-hashed runner chunk, so it changes
      // exactly when the runner changes. Keying this on the version instead meant
      // that installing over an existing app kept serving the previously copied
      // runner, because versionName and versionCode stay put across builds -- an
      // updated web-runner simply never reached the WebView.
      // The locale JSON is fetched by the runner at runtime and is not hashed into
      // index.html, so a locale-only update (a background error string patched in
      // place) needs its own comparison or it never reaches the WebView either.
      const FRESHNESS_FILES = ['index.html', 'locales/en/translation.json'];
      let isUpToDate = true;

      for (const file of FRESHNESS_FILES) {
        if (!(await RNFS.exists(`${ANDROID_BUNDLE_PATH}/${file}`))) {
          isUpToDate = false;
          break;
        }

        const shipped = await RNFS.readFileAssets(`${BUNDLE_PATH}/site/${file}`, 'utf8');
        const copied = await RNFS.readFile(`${ANDROID_BUNDLE_PATH}/${file}`, 'utf8');

        if (shipped !== copied) {
          isUpToDate = false;
          break;
        }
      }

      if (isUpToDate) {
        return;
      }

      await copyAndroidWebBundle(BUNDLE_PATH);
      started = false;
    } catch (e) {
      console.warn('Failed to prepare Android WebRunner bundle', e);
    }
  }

  update(globalState: WebRunnerGlobalState, dispatch: React.Dispatch<WebRunnerControlAction>) {
    this.state = globalState;
    this.runnerState = globalState.stateRef.current || {};
    this.webRef = globalState.runnerRef;
    this.eventEmitter = globalState.eventEmitter;
    this.dispatch = dispatch;
  }

  active() {
    if (this.status !== 'inactive') {
      return;
    }

    this.status = 'activating';
    this.activateRetryTimeout && clearTimeout(this.activateRetryTimeout);

    this.serverReady()
      .then(() => {
        this.activateAttempts = 0;
        this.dispatch && this.dispatch({ type: 'active' });
        this.status = 'active';
        this.startReadyWatchdog();
      })
      .catch(e => {
        // Going back to 'inactive' is the whole point: the status used to stay at 'activating'
        // after a rejected serverReady(), and since active() only runs while 'inactive', nothing
        // could ever ask again - no WebView was mounted and the app sat on the spinner for good.
        console.warn('### WebRunner server start failed', e);
        this.status = 'inactive';

        const delay = Math.min(30000, 3000 * 2 ** this.activateAttempts);

        this.activateAttempts += 1;
        this.activateRetryTimeout = setTimeout(() => this.active(), delay);
      });
  }

  sleep() {
    this.stopPing();
    this.clearReadyWatchdog();
    this.activateRetryTimeout && clearTimeout(this.activateRetryTimeout);
    this.activateRetryTimeout = undefined;
    this.dispatch && this.dispatch({ type: 'sleep' });
    this.status = 'inactive';
  }

  reload() {
    this.webRef?.current?.reload();
    // Stop claiming crypto_ready: the reducer's 'rerender' path writes this, the direct reload
    // here never did, and a stale crypto_ready makes recoverRunner's own guard - and the resume
    // branch of onAppStateChange - trust a runner that is being torn down. A reload that lands
    // nowhere then left nothing at all watching it.
    this.runnerState.status = 'reloading';
    this.eventEmitter?.emit('update-status', 'reloading');
    // A reload that leads nowhere is the common shape of this bug, so let the watchdog judge it.
    this.startReadyWatchdog();
    console.debug('Reload the web-runner');
  }

  /**
   * A WebView load failure (unreachable origin, 4xx/5xx, a dead content process). Bounded, but no
   * longer one-shot: the first failure used to consume the only repair attempt this JS context
   * had, so anything that failed twice stayed broken until the process was killed.
   */
  onLoadFailure(reason: string) {
    if (this.loadFailureCount >= LOAD_FAILURE_MAX_RECOVERIES) {
      return;
    }

    // Also stale after a content process death: the runner reported crypto_ready and then the
    // page was killed, so the guard in recoverRunner would skip the repair and the only thing
    // left to notice would be the ping, half a minute later. Not emitted on purpose - a failure
    // that turns out to be transient should not flash the spinner over a working app; the repair
    // emits 'sleep' itself once it really tears the WebView down.
    if (this.runnerState.status === 'crypto_ready') {
      this.runnerState.status = 'reloading';
    }

    const attempt = (this.loadFailureCount += 1);

    // recoverRunner logs and swallows its own failures; the catch is only here so the promise is
    // never floating.
    setTimeout(() => {
      this.recoverRunner(reason).catch(() => undefined);
    }, Math.min(8000, 500 * 2 ** (attempt - 1)));
  }

  startReadyWatchdog(delay = 20000) {
    this.clearReadyWatchdog();
    this.readyWatchdog = setTimeout(() => {
      this.recoverRunner('ready-timeout').catch(() => undefined);
    }, delay);
  }

  clearReadyWatchdog() {
    this.readyWatchdog && clearTimeout(this.readyWatchdog);
    this.readyWatchdog = undefined;
  }

  async restartServer() {
    await stopStaticServerForRestart();

    return this.serverReady();
  }

  /**
   * The one repair path: probe the port, rebuild the server if it is gone, then remount the
   * WebView. Nothing else watched for "mounted but crypto_ready never arrived" - startPing only
   * runs after crypto_ready, so a runner that never got there had no way back.
   */
  async recoverRunner(reason: string) {
    if (isRecovering || this.runnerState.status === 'crypto_ready') {
      return;
    }

    // Never repair in the background: iOS can suspend mid-flight, and a server started there may
    // not survive to the next foreground - the resume path arms the watchdog again anyway.
    if (AppState.currentState !== 'active') {
      this.startReadyWatchdog();

      return;
    }

    isRecovering = true;
    this.recoveryAttempts += 1;
    console.warn(`### WebRunner recovery (${reason}) attempt ${this.recoveryAttempts}`);

    try {
      if (!(await isStaticServerReachable())) {
        await this.restartServer();
      }

      this.sleep();
      this.active();
    } catch (e) {
      console.warn('### WebRunner recovery failed', e);
    } finally {
      isRecovering = false;
      this.startReadyWatchdog(Math.min(60000, 20000 * this.recoveryAttempts));
    }
  }

  async waitForIndexHtml(dir: string, retry = 20) {
    for (let i = 0; i < retry; i++) {
      const ok = await RNFS.exists(`${dir}/index.html`);
      if (ok) return true;
      await new Promise(r => setTimeout(r, 300));
    }
    return false;
  }

  async serverReady() {
    if (started && server) {
      return true;
    }

    if (serverReadyPromise) {
      return serverReadyPromise;
    }

    serverReadyPromise = this.startServer();

    try {
      return await serverReadyPromise;
    } finally {
      serverReadyPromise = null;
    }
  }

  private async startServer() {
    if (started && server) {
      return true;
    }

    if (Platform.OS === 'android') {
      await this.androidBundleReadyPromise;
    }

    const BUNDLE_PATH = isDevMode ? 'DevModeWeb.bundle' : 'Web.bundle';
    const fileDir = Platform.OS === 'android'
      ? `${RNFS.DocumentDirectoryPath}/${BUNDLE_PATH}/site`
      : `${RNFS.MainBundlePath}/${BUNDLE_PATH}/site`;

    for (let i = 0; i < 20; i++) {
      if (await RNFS.exists(`${fileDir}/index.html`)) break;
      await new Promise(r => setTimeout(r, 300));
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= SERVER_START_MAX_ATTEMPTS; attempt++) {
      await safeStopServer(server);

      server = new StaticServer({ port: WEB_SERVER_PORT, fileDir });

      try {
        await server.start();
        started = true;

        return true;
      } catch (e: any) {
        lastError = e;

        // A server from a previous JS context is still registered natively. Only treat that as
        // success when it really answers - it used to be trusted blindly, and the old context's
        // teardown is racing to shut down that exact server, which left the app on a dead port
        // with no way back: serverReady() short-circuits on `started && server` forever.
        if (e?.message?.includes('Another Server instance is active')) {
          if (await isStaticServerReachable()) {
            started = true;

            return true;
          }

          console.warn(`### WebRunner server conflict, survivor unreachable (attempt ${attempt})`);
        } else {
          console.warn(`### WebRunner server start failed (attempt ${attempt})`, e);
        }

        server = null;
        started = false;

        if (attempt < SERVER_START_MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, Math.min(4000, 500 * 2 ** (attempt - 1))));
        }
      }
    }

    throw lastError;
  }

  ping() {
    this.webRef?.current?.injectJavaScript(
      `window.postMessage(${JSON.stringify({
        id: getId(),
        message: 'mobile(ping)',
        request: null,
        origin: undefined,
      })})`,
    );
  }

  startPing(pingInterval: number = 30000, timeCheck: number = 3000, pingTimeout: number = 15000) {
    this.stopPing();
    this.lastTimeResponse = undefined;
    this.pingInterval && clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      this.ping();
      this.pingCheck(timeCheck, pingTimeout);
    }, pingInterval);

    // this.startPingCheck(timeout, directTimeCheck);
  }

  stopPing() {
    this.pingInterval && clearInterval(this.pingInterval);
    this.pingTimeout && clearTimeout(this.pingTimeout);
    this.clearResumePingTimeout();
    this.clearOutOfResponseTimeTimeout();
  }

  clearResumePingTimeout() {
    this.resumePingTimeout && clearTimeout(this.resumePingTimeout);
    this.resumePingTimeout = undefined;
  }

  clearOutOfResponseTimeTimeout() {
    this.outOfResponseTimeTimeout && clearTimeout(this.outOfResponseTimeTimeout);
  }

  pingCheck(timeCheck: number = 999, timeout = 9999, maxRetry = 3) {
    const flag = {
      retry: 0,
    };

    const check = () => {
      this.pingTimeout && clearTimeout(this.pingTimeout);

      this.pingTimeout = setTimeout(() => {
        const offsetTime = this.lastTimeResponse ? new Date().getTime() - this.lastTimeResponse : 0;
        if (offsetTime > timeout || offsetTime === 0) {
          if (flag.retry < maxRetry) {
            this.ping();
            check();
            flag.retry += 1;
          } else {
            this.reload();
          }
        } else {
          flag.retry = 0;
        }
      }, timeCheck);
    };

    check();
  }

  rerender() {
    this.dispatch && this.dispatch({ type: 'rerender' });
  }

  onRunnerMessage(eventData: NativeSyntheticEvent<WebViewMessage>) {
    if (isWebRunnerAlive(eventData)) {
      this.clearOutOfResponseTimeTimeout();

      if (AppState.currentState === 'active') {
        // Save the lastTimeResponse to check it later
        this.lastTimeResponse = new Date().getTime();

        this.outOfResponseTimeTimeout = setTimeout(() => {
          this.eventEmitter?.emit('update-status', 'out_of_response_time');
        }, ACCEPTABLE_RESPONSE_TIME);
      }
    }

    listenMessage(JSON.parse(eventData.nativeEvent.data), this.eventEmitter, (unHandleData: Message['data']) => {
      if (!this.runnerState) {
        this.runnerState = {};
      }
      const { id, response } = unHandleData as { id: string; response: Object };
      if (id === '0') {
        const statusData = response as { status: WebRunnerStatus };
        const webViewStatus = statusData?.status;
        this.runnerState.status = webViewStatus;
        this.eventEmitter?.emit('update-status', webViewStatus);

        console.debug(`### Web Runner Status: ${webViewStatus}`);

        if (webViewStatus === 'require_restore') {
          restoreStorageData();
          notifyUnstable();
        } else if (webViewStatus === 'crypto_ready') {
          this.clearReadyWatchdog();
          this.recoveryAttempts = 0;
          this.activateAttempts = 0;
          this.loadFailureCount = 0;

          if (this.shouldReloadHandler) {
            restartAllHandlers();
          }
          this.shouldReloadHandler = true;
          this.startPing();

          if (!this.isBackupOnInit) {
            triggerBackupOnInit();
            this.isBackupOnInit = true;
          }
        } else {
          this.stopPing();
        }

        return true;
      } else if (id === '-1') {
        const info = response as { url: string; version: string; userAgent: string };
        console.debug('### Web Runner Info:', info);
        this.runnerState.url = info.url;
        this.runnerState.version = info.version;
        this.runnerState.userAgent = info.userAgent;
        if (Platform.OS === 'android') {
          const needUpdateChrome = parseInt(info.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)?.[2] || '0', 10);
          if (needUpdateChrome !== 0) {
            setTimeout(
              () => DeviceEventEmitter.emit(NEED_UPDATE_CHROME, needUpdateChrome <= WEBVIEW_ANDROID_SYSTEM_MIN_VERSION),
              500,
            );
          }
        }

        return true;
      } else if (id === '-2') {
        console.debug('### Web Runner Console:', ...(response as any[]));
        return true;
      } else if (response === 'mobile:ping') {
        console.log('mobile:ping');
        console.debug('### Web Runner Ping', this.lastTimeResponse);
        return true;
      } else {
        return false;
      }
    });
  }

  private onAppStateChange = (state: AppStateStatus) => {
    const now = Date.now();
    mmkvStore.set('runnerState', `${this.runnerState.status}`);
    if (state === 'active') {
      this.clearResumePingTimeout();

      if (this.lastActiveTime && now - this.lastActiveTime > LONG_TIMEOUT) {
        this.reload();
      } else if (this.runnerState.status === 'crypto_ready') {
        this.ping();
        this.startPing();
      } else {
        // Not ready on resume: ping later as before, but also let the watchdog repair it if the
        // runner never reports back - this branch used to install no recovery of any kind.
        this.startReadyWatchdog();
        this.resumePingTimeout = setTimeout(() => {
          this.ping();
          this.startPing();
        }, 15000);
      }
    } else {
      this.lastActiveTime = now;
      this.stopPing();
      this.clearReadyWatchdog();
    }
  }
}
