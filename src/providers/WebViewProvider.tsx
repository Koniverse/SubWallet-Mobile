import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebViewContext } from './contexts';
import WebView from 'react-native-webview';
import { listenMessage, setViewRef } from '../messaging';
import { NativeSyntheticEvent, Platform, View } from 'react-native';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import SplashScreen from 'react-native-splash-screen';
import * as RNFS from 'react-native-fs';
// @ts-ignore
import StaticServer from '@dr.pogodin/react-native-static-server';

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
const getPath = () => {
  return Platform.OS === 'android' ? RNFS.DocumentDirectoryPath + '/www' : RNFS.MainBundlePath + '/www';
};

// const moveAndroidFiles = async () => {
//   if (Platform.OS === 'android') {
//     await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/www');
//     const files = ['www/index.html', 'www/index.css', 'www/index.js'];
//     for (const file of files) {
//       await RNFS.copyFileAssets(file, RNFS.DocumentDirectoryPath + '/' + file);
//     }
//   }
// };

export const WebViewProvider = ({ children }: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>();
  let path = getPath();
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  const [server] = useState(new StaticServer(1312, path));

  const [status, setStatus] = useState('init');

  useEffect(() => {
    let isSync = true;

    server.start().then((serverUrl: string) => {
      console.log(serverUrl);
      if (isSync) {
        if (Platform.OS === 'ios') {
          setWebViewUrl(`${serverUrl}/index.html`);
        } else {
          setWebViewUrl('file:///android_asset/web-runner-core/index.html');
        }
      }
    });

    return () => {
      if (server && server.isRunning()) {
        server.stop();
      }
      isSync = false;
    };
  }, [server]);

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
          source={{ uri: webViewUrl }}
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
