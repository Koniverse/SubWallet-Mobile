import { useEffect } from 'react';
import { EN_US } from 'utils/i18n/i18n';
import moment from 'moment';

export default function useSetupI18n(language: string, status?: string): void {
  const setupI18n = (userLang: string) => {
    const i18nModule = '../utils/i18n/i18n';
    return import(i18nModule).then(({ default: i18n }) => {
      i18n.setLanguage(userLang || EN_US);
      moment.locale(userLang);
    });
  };

  useEffect(() => {
    if (status) {
      setupI18n(language).catch(e => console.log('--- setupI18n error:', e));
    }
  }, [language, status]);
}
