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

export default i18n;
