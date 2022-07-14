import LocalizedStrings from 'react-native-localization';
import { vi } from './vi_VN';
import { en } from './en_US';
const i18n = new LocalizedStrings({
  en: {
    ...en,
  },
  vi: {
    ...vi,
  },
});

export const VI_VN = 'vi';
export const EN_US = 'en';

export default i18n;
