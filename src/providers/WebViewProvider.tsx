import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebViewContext, WebviewStatus } from './contexts';
import WebView from 'react-native-webview';
import { listenMessage, setupWebview } from '../messaging';
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import EventEmitter from 'eventemitter3';

interface WebViewProviderProps {
  children?: React.ReactNode;
  viewRef?: MutableRefObject<WebView | undefined>;
}

// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
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
// if (__DEV__) {
//   injectedJS += `
//   const consoleLog = (type, args) => window.ReactNativeWebView.postMessage(JSON.stringify({id: '-2', 'response': [type, ...args]}));
//   console = {
//       log: (...args) => consoleLog('log', [...args]),
//       debug: (...args) => consoleLog('debug', [...args]),
//       info: (...args) => consoleLog('info', [...args]),
//       warn: (...args) => consoleLog('warn', [...args]),
//       error: (...args) => consoleLog('error', [...args]),
//   };`;
// }

const eventEmitter = new EventEmitter();

let pingTimeout: NodeJS.Timeout | undefined;
let reloadTimeout: NodeJS.Timeout | undefined;
let runPingCheck = false;

const pingWebView = (webRef: React.RefObject<WebView<{}>>) => {
  if (!runPingCheck) {
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
    }, 3000);
  }, 6000);
};

export const WebViewProvider = ({ children }: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>(null);
  const sourceUri = (Platform.OS === 'android' ? 'file:///android_asset/' : '') + 'Web.bundle/loader.html';
  // const sourceUri = 'http://192.168.10.189:9000'; // Use for developing web runner real time
  const [status, setStatus] = useState<WebviewStatus>('init');
  const [isReady, setIsReady] = useState(false);
  const [version, setVersion] = useState('unknown');
  const [url, setUrl] = useState(sourceUri);

  const setWebviewStatus = (webviewStatus: WebviewStatus) => {
    setStatus(webviewStatus);
    const _isReady = webviewStatus === 'crypto_ready';
    setIsReady(_isReady);
    runPingCheck = _isReady;
    eventEmitter.emit('update-status', webviewStatus);
    eventEmitter.emit(webviewStatus, webviewStatus);
  };

  const onMessage = (data: NativeSyntheticEvent<WebViewMessage>) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    listenMessage(JSON.parse(data.nativeEvent.data), data => {
      pingWebView(webRef);
      // @ts-ignore
      if (data.id === '0' && data.response?.status) {
        // @ts-ignore
        const webViewStatus = data.response?.status as string;
        if (webViewStatus === 'ping') {
          reloadTimeout && clearTimeout(reloadTimeout);
        } else {
          setWebviewStatus(webViewStatus as WebviewStatus);
          console.debug(`### Web View Status: ${webViewStatus}`);
        }
        return true;
      } else if (data.id === '-1') {
        // @ts-ignore
        const info = data.response as { url: string; version: string };
        console.debug('### Web View Info:', info);
        setUrl(info.url);
        setVersion(info.version);
        return true;
      } else if (data.id === '-2') {
        // @ts-ignore
        console.debug('### Web View Console:', ...data.response);
        return true;
      } else {
        return false;
      }
    });
  };

  useEffect(() => {
    setupWebview(webRef, eventEmitter);
  }, [webRef]);

  const reload = useCallback(() => {
    setWebviewStatus('reloading');
    webRef?.current?.reload();
  }, [webRef]);

  return (
    <WebViewContext.Provider value={{ viewRef: webRef, status, isReady, eventEmitter, url, version, reload }}>
      <View style={{ height: 0 }}>
        <WebView
          // injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
          ref={webRef}
          onMessage={onMessage}
          source={{ uri: sourceUri }}
          originWhitelist={['*']}
          injectedJavaScript={injectedJS}
          onError={e => console.debug('----- WebView error', e)}
          onHttpError={e => console.debug('----- WebView HttpError', e)}
          javaScriptEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          domStorageEnabled={true}
        />
      </View>
      {children}
    </WebViewContext.Provider>
  );
};
