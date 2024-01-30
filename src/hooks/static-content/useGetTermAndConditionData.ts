import { baseStaticDataUrl } from 'hooks/static-content/useGetDAppList';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import { TermAndCondition } from 'constants/termAndCondition';
import { mmkvStore } from 'utils/storage';

export function useGetTermAndCondition() {
  const language = useSelector((state: RootState) => state.settings.language);

  const getTermAndCondition = useCallback(async () => {
    fetch(`${baseStaticDataUrl}/term-and-condition/${language}.md`)
      .then(rs => rs.text())
      .then(md => mmkvStore.set('generalTermContent', md))
      .catch(() => {
        const generalTermData = mmkvStore.getString(`generalTerm${language}Content`);
        if (!generalTermData) {
          mmkvStore.set('generalTermContent', TermAndCondition[language as 'en' | 'vi' | 'zh' | 'ru' | 'ja']);
        }
      });
  }, [language]);

  return { getTermAndCondition };
}
