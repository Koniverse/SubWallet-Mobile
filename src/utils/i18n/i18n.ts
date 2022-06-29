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

// const i18n = new LocalizedString({
//   en: {
//     settings: 'Settings',
//   },
//   vi: {
//     settings: 'Cài đặt',
//   },
// });

// export const VI_VN = 'vi_VN';
// export const EN_US = 'en_US';

export default i18n;
