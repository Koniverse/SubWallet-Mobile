// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
import { AppState, DeviceEventEmitter, NativeSyntheticEvent, Platform, View } from 'react-native';
import EventEmitter from 'eventemitter3';
import React, { useEffect, useReducer } from 'react';
import WebView from 'react-native-webview';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { WebRunnerState, WebRunnerStatus } from 'providers/contexts';
import StaticServer from 'react-native-static-server';
import { listenMessage, restartAllHandlers } from 'messaging/index';
import { Message } from '@subwallet/extension-base/types';
import RNFS from 'react-native-fs';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { getId } from '@subwallet/extension-base/utils/getId';
import { backupStorageData, getDevMode, mmkvStore, restoreStorageData, triggerBackupOnInit } from 'utils/storage';
import { notifyUnstable } from 'providers/WebRunnerProvider/nofifyUnstable';
import { WEBVIEW_ANDROID_SYSTEM_MIN_VERSION } from 'constants/index';

const WEB_SERVER_PORT = 9135;
const LONG_TIMEOUT = 360000; //6*60*1000
const ACCEPTABLE_RESPONSE_TIME = 30000;
export const NEED_UPDATE_CHROME = 'need_update_chrome';
const oldLocalStorageBackUpData = mmkvStore.getString('backupStorage');
const isFirstLaunch = mmkvStore.getAllKeys().length === 0;
const storedCompleteBackUpData = mmkvStore.getBoolean('backup-data-for-android');

const completeBackUpData = !isFirstLaunch ? storedCompleteBackUpData : true;

const getJsInjectContent = () => {
  let injectedJS = `
  // Update config data
  setTimeout(() => {
    var info = {
      url: window.location.href,
      version: JSON.parse(localStorage.getItem('application') || '{}').version,
      userAgent: navigator.userAgent
    }
  
    window.ReactNativeWebView.postMessage(JSON.stringify({id: '-1', 'response': info }))
  }, 300);
`;

  return injectedJS;
};

function isWebRunnerAlive(eventData: NativeSyntheticEvent<WebViewMessage>): boolean {
  try {
    const data = JSON.parse(eventData.nativeEvent.data);

    return (
      !!data.id &&
      !['0', '-1', '-2'].includes(data.id) &&
      (data.response !== undefined || data.subscription !== undefined)
    );
  } catch (e) {
    return false;
  }
}

let needFallBack = false;

export const getMajorVersionIOS = (): number => {
  if (Platform.OS !== 'ios') {
    return 17;
  }

  return parseFloat(Platform.Version);
};

class WebRunnerHandler {
  eventEmitter?: EventEmitter;
  webRef?: React.RefObject<WebView<{}>>;
  server?: StaticServer;
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

  update(globalState: WebRunnerGlobalState, dispatch: React.Dispatch<WebRunnerControlAction>) {
    this.state = globalState;
    this.runnerState = globalState.stateRef.current || {};
    this.webRef = globalState.runnerRef;
    this.eventEmitter = globalState.eventEmitter;
    this.dispatch = dispatch;
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

  reload() {
    this.webRef?.current?.reload();
    this.eventEmitter?.emit('update-status', 'reloading');
    console.debug('Reload the web-runner');
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

  async serverReady() {
    // No need server for android => this logic is same with isAndroid
    if (!this.server) {
      return true;
    }

    const isRunning = await this.server.isRunning();
    if (!isRunning) {
      await this.server.start();
    }
    return true;
  }

  active() {
    if (this.status === 'inactive') {
      this.status = 'activating';
      this.serverReady()
        .then(() => {
          this.dispatch && this.dispatch({ type: 'active' });
          this.status = 'active';
        })
        .catch(console.error);
    }
  }

  sleep() {
    this.stopPing();
    this.dispatch && this.dispatch({ type: 'sleep' });
    this.status = 'inactive';
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
        console.debug('### Web Runner Ping', this.lastTimeResponse);
        return true;
      } else {
        return false;
      }
    });
  }

  async getAllFiles(folderPath: string, path: string): Promise<Array<string>> {
    const filePaths: string[] = [];
    const assetDirItems = await RNFS.readDirAssets(path);
    for (const dirItem of assetDirItems) {
      if (dirItem.isFile()) {
        filePaths.push(dirItem.path);
      } else {
        await RNFS.mkdir(`${folderPath}/${dirItem.path}`);
        const dirItemFiles = await this.getAllFiles(folderPath, dirItem.path);
        filePaths.push(...dirItemFiles);
      }
    }
    return filePaths;
  }

  constructor() {
    const isDevMode = getDevMode();
    if (Platform.OS === 'android') {
      if (completeBackUpData) {
        const DOCUMENT_DIRECTORY_PATH = RNFS.DocumentDirectoryPath;
        const BUNDLE_PATH = isDevMode ? 'DevModeWeb.bundle' : 'Web.bundle';
        const ANDROID_BUNDLE_PATH = `${DOCUMENT_DIRECTORY_PATH}/${BUNDLE_PATH}`;
        (async () => {
          const hasCopiedAssets = await RNFS.exists(`${ANDROID_BUNDLE_PATH}/index.html`);
          const lastAppCopyVersion = mmkvStore.getString('last-app-copy-version');
          if (hasCopiedAssets && getVersion() === lastAppCopyVersion) {
            return;
          }
          const files = await this.getAllFiles(DOCUMENT_DIRECTORY_PATH, BUNDLE_PATH);
          if (hasCopiedAssets) {
            files.map(async filePath => {
              await RNFS.unlink(filePath);
            });
          }
          await RNFS.mkdir(ANDROID_BUNDLE_PATH);
          await Promise.all(
            files.map(async filePath => {
              await RNFS.copyFileAssets(filePath, `${DOCUMENT_DIRECTORY_PATH}/${filePath}`);
            }),
          );
          this.reload();
        })();
        this.server = new StaticServer(WEB_SERVER_PORT, ANDROID_BUNDLE_PATH, { localOnly: true });
      }
    } else {
      let target = isDevMode ? '/DevModeWeb.bundle' : '/Web.bundle';
      if (needFallBack) {
        target = '/Fallback.bundle';
      }
      this.server = new StaticServer(WEB_SERVER_PORT, RNFS.MainBundlePath + target, { localOnly: true });
    }
    AppState.addEventListener('change', (state: string) => {
      const now = new Date().getTime();
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
    });
  }
}

const webRunnerHandler = new WebRunnerHandler();

interface WebRunnerGlobalState {
  uri?: string;
  injectScript: string;
  runnerRef: React.RefObject<WebView<{}>>;
  stateRef: React.RefObject<WebRunnerState>;
  eventEmitter: EventEmitter;
}

interface WebRunnerControlAction {
  type: string;
  payload?: Partial<WebRunnerGlobalState>;
}

const now = new Date().getTime();

const URI_PARAMS = '?platform=' + Platform.OS + `&version=${getVersion()}&build=${getBuildNumber()}&time=${now}`;

const devWebRunnerURL = mmkvStore.getString('__development_web_runner_url__');

const getBaseUri = () => {
  const osWebRunnerURL =
    Platform.OS === 'android' && !completeBackUpData
      ? 'file:///android_asset/FallbackWeb.bundle/site'
      : `http://localhost:${WEB_SERVER_PORT}/site`;

  return !devWebRunnerURL || devWebRunnerURL === '' ? osWebRunnerURL : devWebRunnerURL;
};

let BASE_URI = getBaseUri();

const webRunnerReducer = (state: WebRunnerGlobalState, action: WebRunnerControlAction): WebRunnerGlobalState => {
  const { type } = action;

  switch (type) {
    case 'rerender':
      state.eventEmitter?.emit('update-status', 'reloading');
      if (state.stateRef.current) {
        state.stateRef.current.status = 'reloading';
      }
      state.eventEmitter.emit('reloading');
      return { ...state };
    case 'active':
      const targetURI = `${BASE_URI}/index.html${URI_PARAMS}`;
      return { ...state, uri: targetURI };
    case 'sleep':
      state.uri = undefined;
      state.eventEmitter?.emit('update-status', 'sleep');
      if (state.stateRef.current) {
        state.stateRef.current.status = 'sleep';
        state.stateRef.current.url = '';
        state.stateRef.current.version = '';
      }
      state.eventEmitter.emit('sleep');
      return { ...state };
  }

  return state;
};

interface Props {
  webRunnerRef: React.RefObject<WebView<{}>>;
  webRunnerStateRef: React.RefObject<WebRunnerState>;
  webRunnerEventEmitter: EventEmitter;
  isReady: boolean;
  setUpdateComplete: (value: boolean) => void;
}

if (oldLocalStorageBackUpData) {
  // BACKUP-001: Migrate backed up local storage from 1.1.12 and remove old key
  mmkvStore.set('backup-localstorage', oldLocalStorageBackUpData);
  mmkvStore.set('webRunnerLastMigrationTime', new Date().toString());
  mmkvStore.delete('backupStorage');
}

export const WebRunner = React.memo(
  ({ webRunnerRef, webRunnerStateRef, webRunnerEventEmitter, isReady, setUpdateComplete }: Props) => {
    const [runnerGlobalState, dispatchRunnerGlobalState] = useReducer(webRunnerReducer, {
      injectScript: getJsInjectContent(),
      runnerRef: webRunnerRef,
      stateRef: webRunnerStateRef,
      eventEmitter: webRunnerEventEmitter,
    });

    webRunnerHandler.update(runnerGlobalState, dispatchRunnerGlobalState);
    webRunnerHandler.active();

    useEffect(() => {
      if (Platform.OS === 'android') {
        if (isFirstLaunch) {
          mmkvStore.set('backup-data-for-android', true);
        }

        if (!isFirstLaunch && isReady && !storedCompleteBackUpData) {
          backupStorageData(true, false, () => {
            mmkvStore.set('backup-data-for-android', true);
            setUpdateComplete(true);
          });
        }
      }
    }, [isReady, setUpdateComplete]);

    const onMessage = (eventData: NativeSyntheticEvent<WebViewMessage>) => {
      try {
        // BACKUP-002: Check is account & keyring exist to back up
        const webData = JSON.parse(eventData.nativeEvent.data);
        if (webData?.backupStorage && Object.keys(webData?.backupStorage || {})?.length > 0) {
          const isAccount = Object.keys(webData.backupStorage).find((item: string) => item.startsWith('account:'));
          if (isAccount && webData.backupStorage['keyring:subwallet']) {
            mmkvStore.set('backup-localstorage', JSON.stringify(webData.backupStorage));
          }
          return;
        }
      } catch (e) {
        console.log('parse json failed', e);
      }
      webRunnerHandler.onRunnerMessage(eventData);
    };

    const onLoadStart = () => {
      // BACKUP-002: Back up local storage for first open app purpose
      if (webRunnerRef.current) {
        webRunnerRef.current.injectJavaScript(
          'window.ReactNativeWebView.postMessage(JSON.stringify({backupStorage: window.localStorage || ""}));',
        );
      }
    };

    const onLoadProgress = () => {
      // BACKUP-002: Back up local storage for first open app purpose
      if (webRunnerRef.current) {
        webRunnerRef.current.injectJavaScript(
          'window.ReactNativeWebView.postMessage(JSON.stringify({backupStorage: window.localStorage || ""}));',
        );
      }
    };

    return (
      <View style={{ height: 0 }}>
        {runnerGlobalState.uri && (
          <WebView
            ref={webRunnerRef}
            source={{ uri: runnerGlobalState.uri }}
            onMessage={onMessage}
            originWhitelist={['*']}
            injectedJavaScript={runnerGlobalState.injectScript}
            webviewDebuggingEnabled
            onLoadStart={onLoadStart}
            onLoadProgress={onLoadProgress}
            onError={e => console.debug('### WebRunner error', e)}
            onHttpError={e => {
              const old = needFallBack;
              needFallBack = true;
              if (!old) {
                BASE_URI = getBaseUri();

                webRunnerHandler.sleep();
                webRunnerHandler.active();
                webRunnerHandler.reload();
              }
              console.debug('### WebRunner HttpError', e);
            }}
            javaScriptEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            domStorageEnabled={true}
          />
        )}
      </View>
    );
  },
);
