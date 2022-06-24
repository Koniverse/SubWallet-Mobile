import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebViewContext } from './contexts';
import WebView from 'react-native-webview';
import {
  listenMessage,
  saveCurrentAccountAddress,
  setViewRef,
  subscribeAccountsWithCurrentAddress,
  subscribeBalance,
  subscribeChainRegistry,
  subscribeNetworkMap,
  subscribePrice,
  subscribeSettings,
} from '../messaging';
import { NativeSyntheticEvent, View } from 'react-native';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { updateAccounts, updateCurrentAccount } from 'stores/Accounts';
import { useDispatch } from 'react-redux';
import { updatePrice } from 'stores/Price';
import { updateNetworkMap } from 'stores/NetworkMap';
import { useToast } from 'react-native-toast-notifications';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { updateSettings } from 'stores/Settings';
import { updateChainRegistry } from 'stores/ChainRegistry';
import { updateBalance } from 'stores/Balance';

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

const baseUrl = 'https://wallet-runner.subwallet.app/';

export const WebViewProvider = ({ children }: WebViewProviderProps): React.ReactElement<WebViewProviderProps> => {
  const webRef = useRef<WebView>();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('init');
  const toast = useToast();

  const onMessage = useCallback(
    (data: NativeSyntheticEvent<WebViewMessage>) => {
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
    },
    [toast],
  );

  const onWebViewLoaded = useCallback(() => {
    console.debug('Web View Loaded');

    subscribeNetworkMap(networkMap => {
      console.debug('networkMapLength');
      dispatch(updateNetworkMap(networkMap));
    }).then(networkMap => {
      console.debug('networkMapLength', networkMap);
      dispatch(updateNetworkMap(networkMap));
    });

    subscribeAccountsWithCurrentAddress(rs => {
      dispatch(updateAccounts(rs.accounts));
      if (rs.currentAddress) {
        console.debug(rs.currentAddress);
        dispatch(updateCurrentAccount(rs.currentAddress));
      } else {
        saveCurrentAccountAddress({ address: ALL_ACCOUNT_KEY }, () => {});
      }
    });

    subscribeChainRegistry(rs => {
      dispatch(updateChainRegistry(rs));
    }).then(rs => {
      dispatch(updateChainRegistry(rs));
    });

    subscribeBalance(null, rs => {
      dispatch(updateBalance(rs));
    }).then(rs => {
      dispatch(updateBalance(rs));
    });

    subscribeSettings(null, settings => {
      dispatch(updateSettings(settings));
    });

    subscribePrice(null, price => {
      dispatch(updatePrice(price));
    }).then(price => {
      dispatch(updatePrice(price));
    });
  }, [dispatch]);

  useEffect(() => {
    setViewRef(webRef);
  }, [webRef]);

  return (
    <WebViewContext.Provider value={{ viewRef: webRef, status }}>
      <View style={{ height: 0 }}>
        <WebView
          // @ts-ignore
          ref={webRef}
          onLoadEnd={onWebViewLoaded}
          injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
          onMessage={onMessage}
          source={{ uri: `${baseUrl}/index.html`, baseUrl }}
          javaScriptEnabled={true}
        />
      </View>
      {children}
    </WebViewContext.Provider>
  );
};
