import { useCallback } from 'react';
import { fetchStaticCache } from '@subwallet/extension-base/utils/fetchStaticCache';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { mmkvStore } from 'utils/storage';
import { ValidatorDataType } from 'types/earning';

export const useGetEarningPoolData = () => {
  const getPoolInfoMap = useCallback(async () => {
    const poolInfoMap = await fetchStaticCache<{ data: Record<string, YieldPoolInfo> }>('earning/yield-pools.json', {
      data: {},
    });

    mmkvStore.set('poolInfoMap', JSON.stringify(poolInfoMap.data));
  }, []);

  const getPoolTargets = useCallback(async (slug: string) => {
    const poolTargets = await fetchStaticCache(`earning/targets/${slug}.json`, []);

    return poolTargets as ValidatorDataType[];
  }, []);

  return { getPoolInfoMap, getPoolTargets };
};
