import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import {WebViewContext} from './contexts';
import WebView from 'react-native-webview';
import {
  listenMessage,
  saveCurrentAccountAddress,
  setViewRef,
  subscribeAccountsWithCurrentAddress,
  subscribePrice,
} from '../messaging';
import {NativeSyntheticEvent, View} from 'react-native';
import {WebViewMessage} from 'react-native-webview/lib/WebViewTypes';
import {updateAccounts, updateCurrentAccount} from '../stores/Accounts';
import {useDispatch} from 'react-redux';
import {updatePrice} from '../stores/Price';
import {useToast} from 'react-native-toast-notifications';

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

const baseUrl = 'http://192.168.10.189:9000';

export const WebViewProvider = ({
  children,
}: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('init');
  const toast = useToast();

  function onMessage(data: NativeSyntheticEvent<WebViewMessage>) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    listenMessage(JSON.parse(data.nativeEvent.data), data => {
      // @ts-ignore
      if (data.id === '0' && data.response?.status) {
        // @ts-ignore
        const webViewStatus = data.response?.status as string;
        setStatus(webViewStatus);
        toast.show(webViewStatus, {
          type: webViewStatus === 'crypto_ready' ? 'success' : 'normal',
        });
        return true;
      } else {
        return false;
      }
    });
  }

  function onWebViewLoaded() {
    console.log('Web View Loaded');
    subscribeAccountsWithCurrentAddress(rs => {
      dispatch(updateAccounts(rs.accounts));
      if (rs.currentAddress) {
        console.log(rs.currentAddress);
        dispatch(updateCurrentAccount(rs.currentAddress));
      } else {
        saveCurrentAccountAddress({address: 'ALL'}, () => {});
      }
    });

    subscribePrice(null, price => {
      dispatch(updatePrice(price));
    });
  }

  useEffect(() => {
    setViewRef(webRef);
  }, [webRef]);

  return (
    <WebViewContext.Provider value={{viewRef: webRef, status}}>
      <View style={{height: 0}}>
        <WebView
          // @ts-ignore
          ref={webRef}
          onLoadEnd={onWebViewLoaded}
          injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
          onMessage={onMessage}
          source={{uri: `${baseUrl}/index.html`, baseUrl}}
          javaScriptEnabled={true}
        />
      </View>
      {children}
    </WebViewContext.Provider>
  );
};
