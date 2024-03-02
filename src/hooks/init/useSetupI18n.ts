import { useEffect, useState } from 'react';
import { EN_US } from 'utils/i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18nModule from 'utils/i18n/i18n';
import { saveLanguage } from 'messaging/index';
import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { updateLanguage } from 'stores/MobileSettings';

const setupI18n = (userLang: string) => {
  i18nModule.setLanguage(userLang || EN_US);
};

export default function useSetupI18n(): { language: string; isI18nReady: boolean } {
  const needMigrateLanguage = useSelector((state: RootState) => state.mobileSettings.language);
  const language = useSelector((state: RootState) => state.settings.language);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (needMigrateLanguage && needMigrateLanguage !== 'en') {
      setupI18n(needMigrateLanguage);
      saveLanguage(needMigrateLanguage as LanguageType).finally(() => {
        dispatch(updateLanguage('en'));
        setIsI18nReady(true);
      });
    } else {
      if (language) {
        setupI18n(language);
        setIsI18nReady(true);
      }
    }
  }, [needMigrateLanguage, language, dispatch]);

  return { language, isI18nReady };
}
