import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebViewContext } from './contexts';
import WebView from 'react-native-webview';
import { listenMessage, setViewRef } from '../messaging';
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import SplashScreen from 'react-native-splash-screen';

interface WebViewProviderProps {
  children?: React.ReactNode;
  viewRef?: MutableRefObject<WebView | undefined>;
}

// Create web view with solution suggested in https://medium0.com/@caphun/react-native-load-local-static-site-inside-webview-2b93eb1c4225
const params = 'platform=' + Platform.OS;
const injectedJS = `
  if (!window.location.search) {
    var link = document.getElementById('progress-bar');
    link.href = './site/index.html?${params}';
    link.click();
  }
`;

export const WebViewProvider = ({ children }: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>();
  const sourceUri = (Platform.OS === 'android' ? 'file:///android_asset/' : '') + 'Web.bundle/loader.html';
  const [status, setStatus] = useState('init');

  const onMessage = useCallback((data: NativeSyntheticEvent<WebViewMessage>) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    listenMessage(JSON.parse(data.nativeEvent.data), data => {
      // @ts-ignore
      if (data.id === '0' && data.response?.status) {
        // @ts-ignore
        const webViewStatus = data.response?.status as string;
        setStatus(webViewStatus);
        console.debug(`### Web View Status: ${webViewStatus}`);
        if (webViewStatus === 'crypto_ready') {
          SplashScreen.hide();
        }
        return true;
      } else {
        return false;
      }
    });
  }, []);

  useEffect(() => {
    setViewRef(webRef);
  }, [webRef]);

  return (
    <WebViewContext.Provider value={{ viewRef: webRef, status }}>
      <View style={{ height: 0 }}>
        <WebView
          // @ts-ignore
          ref={webRef}
          // injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
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
