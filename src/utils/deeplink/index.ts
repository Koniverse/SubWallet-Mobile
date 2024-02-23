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

export function transformUniversalToNative(url: string) {
  return url.replace('https://mobile.subwallet.app/', 'subwallet://');
}

export function handleTriggerDeeplinkAfterLogin(
  appNavigatorDeepLinkStatus: MutableRefObject<AppNavigatorDeepLinkStatus>,
  navigation: NativeStackNavigationProp<RootStackParamList>,
  toast?: ToastType,
) {
  Linking.getInitialURL().then(url => {
    if (!url || prevDeeplinkUrl === url) {
      return;
    }

    appNavigatorDeepLinkStatus.current = AppNavigatorDeepLinkStatus.BLOCK;
    setPrevDeeplinkUrl(url);
    const _url = transformUniversalToNative(url);
    const urlParsed = new urlParse(_url);

    if (urlParsed.hostname === 'browser') {
      Linking.openURL(_url);
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

    Linking.canOpenURL(_url)
      .then(supported => {
        if (supported) {
          if (firstScreenDeepLink.current) {
            Linking.openURL(firstScreenDeepLink.current);
            setFirstScreenDeepLink();
            return;
          }
          Linking.openURL(_url);
        }
      })
      .catch(e => {
        console.warn(`Error opening URL: ${e}`);
      });
  });
}
