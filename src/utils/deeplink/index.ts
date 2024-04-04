import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { Linking } from 'react-native';
import urlParse from 'url-parse';
import queryString from 'querystring';
import { connectWalletConnect } from 'utils/walletConnect';
import { ToastType } from 'react-native-toast-notifications';
import { MutableRefObject } from 'react';
import { AppNavigatorDeepLinkStatus } from 'screens/Home';
import { prevDeeplinkUrl, setPrevDeeplinkUrl } from '../../App';
import { firstScreenDeepLink, setFirstScreenDeepLink } from 'screens/Home/FirstScreen';
import { mmkvStore } from 'utils/storage';

export function transformUniversalToNative(url: string) {
  return url.replace('https://mobile.subwallet.app/', 'subwallet://');
}

const openLinking = (_url: string) => {
  Linking.openURL(_url)
    .then(() => setPrevDeeplinkUrl(_url))
    .catch(console.error);
};

function openDeeplink(_url: string) {
  Linking.canOpenURL(_url)
    .then(supported => {
      if (supported) {
        if (firstScreenDeepLink.current) {
          openLinking(firstScreenDeepLink.current);
          setFirstScreenDeepLink();
          return;
        }
        openLinking(_url);
      }
    })
    .catch(e => {
      console.warn(`Error opening URL: ${e}`);
    });
}

export function handleTriggerDeeplinkAfterLogin(
  appNavigatorDeepLinkStatus: MutableRefObject<AppNavigatorDeepLinkStatus>,
  navigation: NativeStackNavigationProp<RootStackParamList>,
  toast?: ToastType,
) {
  Linking.getInitialURL().then(url => {
    if (!url || prevDeeplinkUrl === url) {
      if (firstScreenDeepLink.current) {
        openLinking(firstScreenDeepLink.current);
        setFirstScreenDeepLink();
      }

      return;
    }

    appNavigatorDeepLinkStatus.current = AppNavigatorDeepLinkStatus.BLOCK;
    const _url = transformUniversalToNative(url);
    const urlParsed = new urlParse(_url);

    if (urlParsed.hostname === 'browser') {
      openLinking(_url);
      return;
    }

    if (urlParsed.hostname === 'wc') {
      if (urlParsed.query.startsWith('?requestId')) {
        return;
      }
      const decodedWcUrl = queryString.decode(urlParsed.query.slice(5));
      const finalWcUrl = Object.keys(decodedWcUrl)[0];
      connectWalletConnect(finalWcUrl, toast);
    }

    if (urlParsed.pathname.startsWith('/transaction-action/earning')) {
      mmkvStore.set('storedDeeplink', url);
    }

    openDeeplink(_url);
  });
}
