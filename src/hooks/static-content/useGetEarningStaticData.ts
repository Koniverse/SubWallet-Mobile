import { useCallback } from 'react';
import axios from 'axios/index';
import { baseStaticDataUrl } from 'hooks/static-content/useGetDAppList';
import { mmkvStore } from 'utils/storage';
import { EARNING_DATA_RAW, UNSTAKE_ALERT_DATA } from '../../../EarningDataRaw';

export function useGetEarningStaticData(language: string) {
  const getEarningStaticData = useCallback(async () => {
    axios
      .get(`${baseStaticDataUrl}/earning/${language}.json`)
      .then(({ data: { earningDetailData, unbondExtraInfo } }) => {
        mmkvStore.set('earningStaticData', JSON.stringify(earningDetailData));
        mmkvStore.set('unstakeStaticData', JSON.stringify(unbondExtraInfo));
      })
      .catch(() => {
        const earningStaticData = mmkvStore.getString('earningStaticData');
        const unstakeStaticData = mmkvStore.getString('unstakeStaticData');
        if (!earningStaticData) {
          mmkvStore.set('earningStaticData', JSON.stringify(EARNING_DATA_RAW));
        }

        if (unstakeStaticData) {
          mmkvStore.set('unstakeStaticData', JSON.stringify(UNSTAKE_ALERT_DATA));
        }
      });
  }, [language]);

  return { getEarningStaticData };
}
