// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import EventEmitter from 'eventemitter3';
import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import WebView from 'react-native-webview';
import { WebViewMessage, WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import { listenMessage } from '../../messaging';
import { Message } from '@subwallet/extension-base/types';
import { WebRunnerState, WebRunnerStatus } from 'providers/contexts';
import StaticServer from 'react-native-static-server';

const WEB_SERVER_PORT = 9135;

const getJsInjectContent = (showLog?: boolean) => {
  let injectedJS = `
  // Update config data
  setTimeout(() => {
    var info = {
      url: window.location.href,
      version: JSON.parse(localStorage.getItem('application') || '{}').version
    }
  
    window.ReactNativeWebView.postMessage(JSON.stringify({id: '-1', 'response': info }))
  }, 2000);
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
let webViewState: WebRunnerState = {};

// Handle ping
let pingInterval: NodeJS.Timer | undefined;
let reloadTimeout: NodeJS.Timeout | undefined;

const startPingInterval = () => {
  console.log('Start ping interval');
  pingInterval = setInterval(() => {
    webRef?.current?.injectJavaScript(
      "window.ReactNativeWebView.postMessage(JSON.stringify({id: '0', 'response': {status: 'ping'} }))",
    );

    reloadTimeout = setTimeout(() => {
      console.warn('Ping check failed: Reload web runner!!!');
      reloadTimeout && clearTimeout(reloadTimeout);
      pingInterval && clearTimeout(pingInterval);
      webRef?.current?.reload();
    }, 16000);
  }, 18000);
};

const onWebviewMessage = (eventData: NativeSyntheticEvent<WebViewMessage>) => {
  listenMessage(JSON.parse(eventData.nativeEvent.data), (unHandleData: Message['data']) => {
    const { id, response } = unHandleData as { id: string; response: Object };
    if (id === '0') {
      const statusData = response as { status: WebRunnerStatus };
      const webViewStatus = statusData?.status;

      // ping is used to check web-runner is alive, not put into web-runner state
      if (webViewStatus === 'ping') {
        // Clear ping timeout
        reloadTimeout && clearTimeout(reloadTimeout);
      } else {
        webViewState.status = webViewStatus;
        eventEmitter?.emit('update-status', webViewStatus);
        console.debug(`### Web Runner Status: ${webViewStatus}`);

        // Clear ping interval and ping timeout
        reloadTimeout && clearTimeout(reloadTimeout);
        pingInterval && clearInterval(pingInterval);
        if (webViewStatus === 'crypto_ready') {
          webViewStatus === 'crypto_ready' && startPingInterval();
        }
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
  const [source, setSource] = useState<WebViewSource | undefined>(undefined);

  useEffect(() => {
    let server: StaticServer;
    const params = 'platform=' + Platform.OS;
    if (Platform.OS === 'android') {
      setSource({ uri: `file:///android_asset/Web.bundle/site/index.html?${params}` });
    } else {
      server = new StaticServer(WEB_SERVER_PORT, RNFS.MainBundlePath + '/Web.bundle/site');

      server.start().then(() => {
        setSource({ uri: `http://localhost:${WEB_SERVER_PORT}?${params}` });
      });
    }

    return () => {
      server && server.stop();
    };
  }, []);

  return (
    <View style={{ height: 0 }}>
      <WebView
        ref={webRunnerRef}
        source={source}
        onMessage={onWebviewMessage}
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
