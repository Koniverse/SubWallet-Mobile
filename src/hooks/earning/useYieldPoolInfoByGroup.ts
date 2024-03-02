// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useYieldPoolInfoByGroup = (group: string): YieldPoolInfo[] => {
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const chainsByAccountType = useGetChainSlugs();

  return useMemo(() => {
    const result: YieldPoolInfo[] = [];

    for (const pool of Object.values(poolInfoMap)) {
      const chain = pool.chain;
      if (chainsByAccountType.includes(chain) && group === pool.group) {
        result.push(pool);
      }
    }

    return result;
  }, [chainsByAccountType, group, poolInfoMap]);
};

export default useYieldPoolInfoByGroup;
