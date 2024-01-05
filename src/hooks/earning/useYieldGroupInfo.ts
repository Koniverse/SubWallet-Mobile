// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceValueInfo } from 'types/balance';
import { YieldGroupInfo } from 'types/earning';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const chainsByAccountType = useGetChainSlugs();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenGroupBalanceMap, tokenBalanceMap } = useAccountBalance(tokenGroupMap, undefined, true);

  return useMemo(() => {
    const result: Record<string, YieldGroupInfo> = {};

    for (const pool of Object.values(poolInfoMap)) {
      const chain = pool.chain;
      if (chainsByAccountType.includes(chain)) {
        const group = pool.group;
        const exists = result[group];
        const chainInfo = chainInfoMap[chain];

        if (exists) {
          let apy: undefined | number;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          if (apy !== undefined) {
            exists.maxApy = Math.max(exists.maxApy || 0, apy);
          }
          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];
          const balance = tokenGroupBalanceMap[group] || tokenBalanceMap[group];
          const freeBalance: BalanceValueInfo = balance?.free || {
            value: BN_ZERO,
            convertedValue: BN_ZERO,
            pastConvertedValue: BN_ZERO,
          };

          result[group] = {
            group: group,
            token: token.slug,
            maxApy: pool.statistic?.totalApy,
            symbol: token.symbol,
            balance: freeBalance,
            isTestnet: chainInfo.isTestnet,
            name: token.name,
          };
        }
      }
    }

    return Object.values(result);
  }, [
    assetRegistry,
    chainInfoMap,
    chainsByAccountType,
    multiChainAssetMap,
    poolInfoMap,
    tokenBalanceMap,
    tokenGroupBalanceMap,
  ]);
};

export default useYieldGroupInfo;
