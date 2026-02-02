// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import EventEmitter from 'eventemitter3';
import React, { useEffect, useReducer } from 'react';
import WebView from 'react-native-webview';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { WebRunnerState } from 'providers/contexts';
import { backupStorageData, mmkvStore } from 'utils/storage';
import { WEB_SERVER_PORT } from './constant';
import { getJsInjectContent, safeJSONParse } from 'providers/WebRunnerProvider/utils';
import { WebRunnerGlobalState, WebRunnerHandler } from 'providers/WebRunnerProvider/WebRunnerHandler';
import { getVersion, getBuildNumber } from 'react-native-device-info';

const oldLocalStorageBackUpData = mmkvStore.getString('backupStorage');
const isFirstLaunch = mmkvStore.getAllKeys().length === 0;
const storedCompleteBackUpData = mmkvStore.getBoolean('backup-data-for-android');

const completeBackUpData = !isFirstLaunch ? storedCompleteBackUpData : true;

let needFallBack = false;

export const getMajorVersionIOS = (): number => {
  if (Platform.OS !== 'ios') {
    return 17;
  }

  return parseFloat(Platform.Version);
};

const webRunnerHandler = new WebRunnerHandler();

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
      ? 'file:///android_asset/FallbackWeb.bundle'
      : `http://localhost:${WEB_SERVER_PORT}`;

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
  webRunnerRef: React.RefObject<WebView<{}> | undefined>;
  webRunnerStateRef: React.RefObject<WebRunnerState>;
  webRunnerEventEmitter: EventEmitter;
  isReady: boolean;
  setUpdateComplete: (value: boolean) => void;
}

if (oldLocalStorageBackUpData) {
  // BACKUP-001: Migrate backed up local storage from 1.1.12 and remove old key
  mmkvStore.set('backup-localstorage', oldLocalStorageBackUpData);
  mmkvStore.set('webRunnerLastMigrationTime', new Date().toString());
  mmkvStore.remove('backupStorage');
}

export const WebRunner = React.memo(
  ({ webRunnerRef, webRunnerStateRef, webRunnerEventEmitter, isReady, setUpdateComplete }: Props) => {
    const [runnerGlobalState, dispatchRunnerGlobalState] = useReducer(webRunnerReducer, {
      injectScript: getJsInjectContent(),
      runnerRef: webRunnerRef,
      stateRef: webRunnerStateRef,
      eventEmitter: webRunnerEventEmitter,
    });

    useEffect(() => {
      webRunnerHandler.update(runnerGlobalState, dispatchRunnerGlobalState);
      webRunnerHandler.active();
      // eslint-disable-next-line
    }, []);

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
      // BACKUP-002: Check is account & keyring exist to back up
      const webData = safeJSONParse(eventData.nativeEvent.data);

      if (webData?.backupStorage && Object.keys(webData?.backupStorage || {})?.length > 0) {
        const isAccount = Object.keys(webData.backupStorage).find((item: string) => item.startsWith('account:'));
        if (isAccount && webData.backupStorage['keyring:subwallet']) {
          mmkvStore.set('backup-localstorage', JSON.stringify(webData.backupStorage));
        }
        return;
      }

      if (typeof webData.id !== 'string') {
        return;
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
            onError={e => console.debug('### WebRunner error', e.nativeEvent)}
            onHttpError={e => {
              console.log('e', e.nativeEvent);
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
