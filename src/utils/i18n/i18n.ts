import LocalizedStrings from 'react-native-localization';
import { en } from './en_US';
import { vi } from './vi_VN';
import { zh } from './zh_CN';
const i18n = new LocalizedStrings({
  en,
  vi,
  zh,
});

export const EN_US = 'en';
export const VI_VN = 'vi';
export const ZH_CN = 'zh';

export default i18n;
