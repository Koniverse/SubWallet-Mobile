import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebViewContext } from './contexts';
import WebView from 'react-native-webview';
import { listenMessage, setViewRef, } from '../messaging';
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import { WebViewMessage, WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import SplashScreen from 'react-native-splash-screen';

interface WebViewProviderProps {
  children?: React.ReactNode;
  viewRef?: MutableRefObject<WebView | undefined>;
}

const ERROR_HANDLE_SCRIPT = `
    window.onerror = function(message, sourcefile, lineno, colno, error) {
      alert("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
      return true;
    };
    true;
`;

const webViewSrc: WebViewSource =
  Platform.OS === 'ios'
    ? require('./../../web-runner-core/index.html')
    : { uri: 'file:///android_asset/web-runner-core/index.html' };

export const WebViewProvider = ({ children }: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>();
  const [status, setStatus] = useState('init');

  const onMessage = useCallback((data: NativeSyntheticEvent<WebViewMessage>) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    listenMessage(JSON.parse(data.nativeEvent.data), data => {
      // @ts-ignore
      if (data.id === '0' && data.response?.status) {
        // @ts-ignore
        const webViewStatus = data.response?.status as string;
        setStatus(webViewStatus);
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
          injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
          onMessage={onMessage}
          source={webViewSrc}
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
