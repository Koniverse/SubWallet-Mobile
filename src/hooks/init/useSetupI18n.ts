import { useEffect, useState } from 'react';
import { EN_US } from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18nModule from 'utils/i18n/i18n';

const setupI18n = (userLang: string) => {
  i18nModule.setLanguage(userLang || EN_US);
};

export default function useSetupI18n(): { language: string; isI18nReady: boolean } {
  const language = useSelector((state: RootState) => state.mobileSettings.language);
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    if (language) {
      setupI18n(language);
      setIsI18nReady(true);
    }
  }, [language]);

  return { language, isI18nReady };
}
