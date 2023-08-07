import { Linking } from 'react-native';
import urlParse from 'url-parse';
import queryString from 'querystring';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

let prevDeeplinkUrl = '';

export const deeplinks = ['subwallet://', 'https://mobile.subwallet.app'];

export function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+#@]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return pattern.test(str);
}

export function getHostName(url: string) {
  try {
    const address = url.split('://')[1].split('/')[0];
    return address.split(':')[0];
  } catch (e) {
    return url;
  }
}

export const searchDomain = 'duckduckgo.com';
export function getProtocol(url: string) {
  try {
    const protocol = url.split('://')[0];
    return protocol;
  } catch (e) {
    return url;
  }
}

export function getValidURL(address: string): string {
  if (isValidURL(address)) {
    return address.startsWith('http://') || address.startsWith('https://') ? address : `https://${address}`;
  } else {
    return `https://${searchDomain}/?q=${encodeURIComponent(address)}`;
  }
}

export function handleDeeplinkOnFirstOpen(navigation: NativeStackNavigationProp<RootStackParamList>) {
  Linking.getInitialURL()
    .then(url => {
      if (!url || prevDeeplinkUrl === url) {
        return;
      }
      prevDeeplinkUrl = url;
      if (getProtocol(url) === 'subwallet') {
        Linking.openURL(url);
      } else if (getProtocol(url) === 'https') {
        const urlParsed = new urlParse(url);
        if (urlParsed.pathname.split('/')[1] === 'browser') {
          // Format like: https://subwallet-link.vercel.app/browser?url=https://hackadot.subwallet.app/
          const finalUrl = queryString.parse(urlParsed.query)['?url'] || '';
          navigation.navigate('BrowserTabsManager', {
            url: Array.isArray(finalUrl) ? finalUrl[0] : finalUrl,
            name: '',
            isOpenTabs: false,
          });
        }
      }
    })
    .catch(e => console.warn('e', e));
}
