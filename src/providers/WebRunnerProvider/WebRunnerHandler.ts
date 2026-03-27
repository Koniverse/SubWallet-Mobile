import EventEmitter from 'eventemitter3';
import React from 'react';
import WebView from 'react-native-webview';
import StaticServer from '@dr.pogodin/react-native-static-server';
import { WebRunnerState, WebRunnerStatus } from 'providers/contexts';
import { AppState, DeviceEventEmitter, NativeSyntheticEvent, Platform } from 'react-native';
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
import { getVersion } from 'react-native-device-info';
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
  status: 'inactive' | 'activating' | 'active' = 'inactive';
  dispatch?: React.Dispatch<WebRunnerControlAction>;
  shouldReloadHandler: boolean = false;
  isBackupOnInit = false;

  constructor() {
    if (Platform.OS === 'android') {
      if (completeBackUpData) {
        const DOCUMENT_DIRECTORY_PATH = RNFS.DocumentDirectoryPath;
        const BUNDLE_PATH = isDevMode ? 'DevModeWeb.bundle' : 'Web.bundle';
        const ANDROID_BUNDLE_PATH = `${DOCUMENT_DIRECTORY_PATH}/${BUNDLE_PATH}/site`;
        (async () => {
          const exists = await RNFS.exists(`${ANDROID_BUNDLE_PATH}/index.html`);
          const lastAppCopyVersion = mmkvStore.getString('last-app-copy-version');
          if (exists && getVersion() === lastAppCopyVersion) {
            return;
          }
          await copyAndroidWebBundle(BUNDLE_PATH);
          this.reload();
        })();
      }
    }

    AppState.addEventListener('change', this.onAppStateChange)
  }

  update(globalState: WebRunnerGlobalState, dispatch: React.Dispatch<WebRunnerControlAction>) {
    this.state = globalState;
    this.runnerState = globalState.stateRef.current || {};
    this.webRef = globalState.runnerRef;
    this.eventEmitter = globalState.eventEmitter;
    this.dispatch = dispatch;
  }

  active() {
    if (this.status === 'inactive') {
      this.status = 'activating';
      this.serverReady()
        .then(() => {
          this.dispatch && this.dispatch({ type: 'active' });
          this.status = 'active';
        })
        .catch(e => console.log('error when start server', e));
    }
  }

  sleep() {
    this.stopPing();
    this.dispatch && this.dispatch({ type: 'sleep' });
    this.status = 'inactive';
  }

  reload() {
    this.webRef?.current?.reload();
    this.eventEmitter?.emit('update-status', 'reloading');
    console.debug('Reload the web-runner');
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
    if (started) {
      return true;
    }

    const basePath = Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;
    const BUNDLE_PATH = isDevMode ? '/DevModeWeb.bundle' : '/Web.bundle';
    const dir = `${basePath}/${BUNDLE_PATH}/site`;

    for (let i = 0; i < 20; i++) {
      if (await RNFS.exists(`${dir}/index.html`)) break;
      await new Promise(r => setTimeout(r, 300));
    }

    if (started && server) {
      return;
    }
    let fileDir: string;

    if (Platform.OS === 'android') {
      fileDir = `${RNFS.DocumentDirectoryPath}/${BUNDLE_PATH}/site`;
    } else {
      const target = isDevMode ? '/DevModeWeb.bundle' : '/Web.bundle';
      fileDir = RNFS.MainBundlePath + target + '/site';
    }

    server = new StaticServer({
      port: WEB_SERVER_PORT,
      fileDir,
    });

    await server.start();

    started = true;
    return true;
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
    this.clearOutOfResponseTimeTimeout();
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

  private onAppStateChange = (state: string) => {
    const now = Date.now();

    if (state === 'active') {
      if (this.lastActiveTime && now - this.lastActiveTime > LONG_TIMEOUT) {
        this.reload();
      } else if (this.runnerState.status === 'crypto_ready') {
        this.ping();
        this.pingCheck(1000, 9000, 0);
        this.startPing();
      } else {
        setTimeout(() => {
          this.ping();
          this.pingCheck(3000, 15000, 0);
          this.startPing();
        }, 15000);
      }
    } else {
      this.lastActiveTime = now;
      this.stopPing();
    }
  }
}