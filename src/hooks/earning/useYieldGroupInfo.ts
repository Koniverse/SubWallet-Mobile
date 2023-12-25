// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
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
          if (pool.metadata.totalApy) {
            exists.maxApy = Math.max(exists.maxApy || 0, pool.metadata.totalApy);
            exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
          }
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];
          const balance = tokenGroupBalanceMap[group] || tokenBalanceMap[group];
          console.log(token.slug, balance);

          result[group] = {
            group: group,
            token: token.slug,
            maxApy: pool.metadata.totalApy,
            symbol: token.symbol,
            balance: balance.free,
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
