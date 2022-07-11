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
  subscribeHistory,
  subscribeNetworkMap,
  subscribePrice,
  subscribeSettings,
} from '../messaging';
import { NativeSyntheticEvent, View } from 'react-native';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { upsertCurrentAccount } from 'stores/Accounts';
import { useDispatch, useSelector } from 'react-redux';
import { updatePrice } from 'stores/Price';
import { updateNetworkMap } from 'stores/NetworkMap';
// import { useToast } from 'react-native-toast-notifications';
import { updateSettings } from 'stores/Settings';
import { updateChainRegistry } from 'stores/ChainRegistry';
import { updateBalance } from 'stores/Balance';
import moment from 'moment';
import { RootState } from 'stores/index';
import { updateTransactionHistory } from 'stores/TransactionHistory';
import SplashScreen from 'react-native-splash-screen';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';

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
  // const toast = useToast();
  const {
    settingData: { language },
  } = useSelector((state: RootState) => state);

  const setupI18n = (userLang: string) => {
    const i18nModule = '../utils/i18n/i18n';
    return import(i18nModule).then(({ default: i18n }) => {
      i18n.setLanguage(userLang);
      moment.locale(userLang.split('_')[0]);
    });
  };

  const onMessage = useCallback(
    (data: NativeSyntheticEvent<WebViewMessage>) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      listenMessage(JSON.parse(data.nativeEvent.data), data => {
        // @ts-ignore
        if (data.id === '0' && data.response?.status) {
          setupI18n(language);
          // @ts-ignore
          const webViewStatus = data.response?.status as string;
          setStatus(webViewStatus);
          // toast.show(webViewStatus, {
          //   type: webViewStatus === 'crypto_ready' ? 'success' : 'normal',
          // });
          if (webViewStatus === 'crypto_ready') {
            SplashScreen.hide();
          }
          return true;
        } else {
          return false;
        }
      });
    },
    [language],
  );

  const onWebViewLoaded = useCallback(() => {
    console.debug('Web View Loaded');
    subscribeNetworkMap(networkMap => {
      dispatch(updateNetworkMap(networkMap));
    }).then(networkMap => {
      dispatch(updateNetworkMap(networkMap));
    });

    subscribeAccountsWithCurrentAddress(rs => {
      const { accounts, currentAddress, currentGenesisHash } = rs;
      if (accounts && accounts.length) {
        let selectedAcc = accounts.find(acc => acc.address === currentAddress);

        if (!selectedAcc) {
          selectedAcc = accounts[0];
          selectedAcc.genesisHash = currentGenesisHash;

          const accountInfo = {
            address: selectedAcc.address,
            currentGenesisHash,
          } as CurrentAccountInfo;

          saveCurrentAccountAddress(accountInfo, () => {
            dispatch(upsertCurrentAccount(selectedAcc as AccountJson));
          }).catch(e => {
            console.error('There is a problem when set Current Account', e);
          });
        } else {
          selectedAcc.genesisHash = currentGenesisHash;
          dispatch(upsertCurrentAccount(selectedAcc));
        }
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
    }).then(rs => {
      dispatch(updateSettings(rs));
    });

    subscribePrice(null, price => {
      dispatch(updatePrice(price));
    }).then(price => {
      dispatch(updatePrice(price));
    });

    subscribeHistory(map => {
      dispatch(updateTransactionHistory(map));
    }).then(map => {
      dispatch(updateTransactionHistory(map));
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
