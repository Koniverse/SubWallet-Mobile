// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import EventEmitter from 'eventemitter3';
import React from 'react';
import WebView from 'react-native-webview';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { listenMessage } from '../../messaging';
import { Message } from '@subwallet/extension-base/types';
import { WebRunnerState, WebRunnerStatus } from 'providers/contexts';

const getJsInjectContent = (showLog?: boolean) => {
  const params = 'platform=' + Platform.OS;
  let injectedJS = `
  // Redirect from loader
  if (!window.location.search) {
    var link = document.getElementById('progress-bar');
    if (link) {
      link.href = './site/index.html?${params}';
      link.click();    
    }
  }

  // Update config data
  setTimeout(() => {
    var info = {
      url: window.location.href,
      version: JSON.parse(localStorage.getItem('application') || '{}').version
    }
  
    window.ReactNativeWebView.postMessage(JSON.stringify({id: '-1', 'response': info }))
  }, 200);
`;
  // Show webview log in development environment
  if (showLog) {
    injectedJS += `
  const consoleLog = (type, args) => window.ReactNativeWebView.postMessage(JSON.stringify({id: '-2', 'response': [type, ...args]}));
  console = {
      log: (...args) => consoleLog('log', [...args]),
      debug: (...args) => consoleLog('debug', [...args]),
      info: (...args) => consoleLog('info', [...args]),
      warn: (...args) => consoleLog('warn', [...args]),
      error: (...args) => consoleLog('error', [...args]),
  };`;
  }

  return injectedJS;
};

let eventEmitter: EventEmitter;
let webRef: React.RefObject<WebView<{}>>;
const sourceUri = (Platform.OS === 'android' ? 'file:///android_asset/' : '') + 'Web.bundle/loader.html';
// const sourceUri = 'http://192.168.10.189:9000'; // Use for developing web runner real time
let webViewState: WebRunnerState = {};

// Handle ping
let pingTimeout: NodeJS.Timeout | undefined;
let reloadTimeout: NodeJS.Timeout | undefined;

const pingWebView = () => {
  if (webViewState.status !== 'crypto_ready') {
    return;
  }
  pingTimeout && clearTimeout(pingTimeout);
  reloadTimeout && clearTimeout(reloadTimeout);
  pingTimeout = setTimeout(() => {
    webRef?.current?.injectJavaScript(
      "window.ReactNativeWebView.postMessage(JSON.stringify({id: '0', 'response': {status: 'ping'} }))",
    );

    reloadTimeout = setTimeout(() => {
      console.warn('Ping check failed: Reload timeout');
      webRef?.current?.reload();
    }, 18000);
  }, 9000);
};

const onWebviewMessage = (eventData: NativeSyntheticEvent<WebViewMessage>) => {
  listenMessage(JSON.parse(eventData.nativeEvent.data), (unHandleData: Message['data']) => {
    pingWebView();
    const { id, response } = unHandleData as { id: string; response: Object };
    if (id === '0') {
      const statusData = response as { status: WebRunnerStatus };
      const webViewStatus = statusData?.status;

      // ping is used to check web-runner is alive, not put into web-runner state
      if (webViewStatus === 'ping') {
        reloadTimeout && clearTimeout(reloadTimeout);
      } else {
        webViewState.status = webViewStatus;
        eventEmitter?.emit('update-status', webViewStatus);
        console.debug(`### Web Runner Status: ${webViewStatus}`);
      }
      return true;
    } else if (id === '-1') {
      const info = response as { url: string; version: string };
      console.debug('### Web Runner Info:', info);
      webViewState.url = info.url;
      webViewState.version = info.version;
      return true;
    } else if (id === '-2') {
      console.debug('### Web Runner Console:', ...(response as any[]));
      return true;
    } else {
      return false;
    }
  });
};

interface Props {
  webRunnerRef: React.RefObject<WebView<{}>>;
  webRunnerStateRef: React.RefObject<WebRunnerState>;
  webRunnerEventEmitter: EventEmitter;
}
export const WebRunner = React.memo(({ webRunnerRef, webRunnerStateRef, webRunnerEventEmitter }: Props) => {
  eventEmitter = webRunnerEventEmitter;
  webRef = webRunnerRef;
  webViewState = webRunnerStateRef.current || {};

  return (
    <View style={{ height: 0 }}>
      <WebView
        ref={webRunnerRef}
        onMessage={onWebviewMessage}
        source={{ uri: sourceUri }}
        originWhitelist={['*']}
        injectedJavaScript={getJsInjectContent(false)}
        onError={e => console.debug('### WebRunner error', e)}
        onHttpError={e => console.debug('### WebRunner HttpError', e)}
        javaScriptEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        domStorageEnabled={true}
      />
    </View>
  );
});
