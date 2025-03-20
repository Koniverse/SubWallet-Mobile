import { useCallback } from 'react';
import axios from 'axios';
import { STATIC_DATA_DOMAIN } from 'constants/index';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { EARNING_POOL_DETAIL_DATA, UNSTAKE_ALERT_DATA } from 'constants/earning/EarningDataRaw';

const dataByDevModeStatus = getStaticContentByDevMode();

export const useGetAppInstructionData = (language: string) => {
  console.log('dataByDevModeStatus', dataByDevModeStatus);
  const getAppInstructionData = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/instruction-news/${dataByDevModeStatus}-${language}.json`)
      .then(({ data }) => {
        const earningDetailData: StaticDataProps[] = [];
        const unstakeStaticData: StaticDataProps[] = [];
        const mktCampaignStaticData: StaticDataProps[] = [];

        (data as StaticDataProps[]).forEach(item => {
          if (item.group && item.group === 'earning') {
            if (item.slug === 'UNSTAKE_INFO') {
              unstakeStaticData.push(item);
            } else {
              earningDetailData.push(item);
            }
          } else {
            mktCampaignStaticData.push(item);
          }
        });

        try {
          mmkvStore.set('appInstructionData', JSON.stringify(mktCampaignStaticData));
          mmkvStore.set('earningStaticData', JSON.stringify(earningDetailData));
          mmkvStore.set('unstakeStaticData', JSON.stringify(unstakeStaticData));
        } catch (e) {
          throw e;
        }
      })
      .catch(e => {
        console.log('get instruction error', e);
        const earningStaticData = mmkvStore.getString('earningStaticData');
        const unstakeStaticData = mmkvStore.getString('unstakeStaticData');
        if (!earningStaticData) {
          mmkvStore.set('earningStaticData', JSON.stringify(EARNING_POOL_DETAIL_DATA));
        }

        if (!unstakeStaticData) {
          mmkvStore.set('unstakeStaticData', JSON.stringify(UNSTAKE_ALERT_DATA));
        }
      });
  }, [language]);

  return { getAppInstructionData };
};
