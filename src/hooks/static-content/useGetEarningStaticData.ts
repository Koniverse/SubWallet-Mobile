import { useCallback } from 'react';
import axios from 'axios/index';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { STATIC_DATA_DOMAIN } from 'constants/index';
import { EARNING_POOL_DETAIL_DATA, UNSTAKE_ALERT_DATA } from 'constants/earning/EarningDataRaw';

const dataByDevModeStatus = getStaticContentByDevMode();

export function useGetEarningStaticData(language: string) {
  const getEarningStaticData = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/instructions/${dataByDevModeStatus}-${language}.json`)
      .then(({ data }) => {
        const earningDetailData = (data as StaticDataProps[]).filter(item => item.slug !== 'UNSTAKE_INFO');
        const unstakeStaticData = (data as StaticDataProps[]).filter(item => item.slug === 'UNSTAKE_INFO');
        try {
          mmkvStore.set('earningStaticData', JSON.stringify(earningDetailData));
          mmkvStore.set('unstakeStaticData', JSON.stringify(unstakeStaticData));
        } catch (e) {
          throw e;
        }
      })
      .catch(() => {
        const earningStaticData = mmkvStore.getString('earningStaticData');
        const unstakeStaticData = mmkvStore.getString('unstakeStaticData');
        if (!earningStaticData) {
          mmkvStore.set('earningStaticData', JSON.stringify(EARNING_POOL_DETAIL_DATA));
        }

        if (unstakeStaticData) {
          mmkvStore.set('unstakeStaticData', JSON.stringify(UNSTAKE_ALERT_DATA));
        }
      });
  }, [language]);

  return { getEarningStaticData };
}
