import { useCallback } from 'react';
import axios from 'axios';
import { STATIC_DATA_DOMAIN } from 'constants/index';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';

const dataByDevModeStatus = getStaticContentByDevMode();

export const useGetAppInstructionData = (language: string) => {
  const getAppInstructionData = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/instructions/${dataByDevModeStatus}-${language}.json`)
      .then(({ data }) => {
        try {
          mmkvStore.set('app-instruction-data', JSON.stringify(data));
        } catch (e) {
          throw e;
        }
      })
      .catch(e => console.error(e));
  }, [language]);

  return { getAppInstructionData };
};
