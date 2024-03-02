import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';
import { STATIC_DATA_DOMAIN } from 'constants/index';
import axios from 'axios';
import { TermAndCondition } from 'constants/termAndCondition';

const dataByDevModeStatus = getStaticContentByDevMode();

export function useGetTermAndCondition() {
  const language = useSelector((state: RootState) => state.settings.language);

  const getTermAndCondition = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/markdown-contents/term_and_condition/${dataByDevModeStatus}-${language}.json`)
      .then(res => {
        console.log('123123123123');
        mmkvStore.set('generalTermContent', res.data.content);
      })
      .catch(() => {
        const generalTermData = mmkvStore.getString(`generalTerm${language}Content`);
        if (!generalTermData) {
          mmkvStore.set('generalTermContent', TermAndCondition[language as 'en' | 'vi' | 'zh' | 'ru' | 'ja']);
        }
      });
  }, [language]);

  return { getTermAndCondition };
}
