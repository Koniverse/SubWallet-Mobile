import LocalizedStrings from 'react-native-localization';
const i18n = new LocalizedStrings({
  en: {
    settings: 'Settings',
  },
  vi: {
    settings: 'Cài đặt',
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
