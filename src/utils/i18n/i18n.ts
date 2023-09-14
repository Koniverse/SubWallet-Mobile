import LocalizedStrings from 'react-native-localization';
import { en } from './en_US';
import { vi } from './vi_VN';
import { zh } from './zh_CN';
import { ja } from './ja_JP';
import { ru } from './ru_RU';
const i18n = new LocalizedStrings({
  en,
  vi,
  zh,
  ja,
  ru,
});

export const EN_US = 'en';
export const VI_VN = 'vi';
export const ZH_CN = 'zh';
export const JA_JP = 'ja';
export const RU_RU = 'ru';

export default i18n;
