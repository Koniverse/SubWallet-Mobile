// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceValueInfo } from 'types/balance';
import { YieldGroupInfo } from 'types/earning';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { YieldPoolType } from '@subwallet/extension-base/types';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const poolInfoMap = useSelector((state: RootState) => state.earning.poolInfoMap);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainsByAccountType = useGetChainSlugsByCurrentAccountProxy();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true);

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

          exists.poolListLength = exists.poolListLength + 1;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          if (apy !== undefined) {
            if (pool.chain === 'bittensor' || pool.chain === 'bittensor_testnet') {
              if (pool.type === YieldPoolType.SUBNET_STAKING) {
                exists.maxApy = Math.max(exists.maxApy || 0, 0);
              }
            } else {
              exists.maxApy = Math.max(exists.maxApy || 0, apy);
            }
          }

          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
          exists.poolSlugs.push(pool.slug);

          const inputAsset = pool.metadata.inputAsset;

          if (!exists.assetSlugs.includes(inputAsset)) {
            exists.assetSlugs.push(inputAsset);

            const balanceItem = tokenBalanceMap[inputAsset];

            if (balanceItem) {
              exists.balance.value = exists.balance.value.plus(balanceItem.free.value);
              exists.balance.convertedValue = exists.balance.convertedValue.plus(balanceItem.free.convertedValue);
              exists.balance.pastConvertedValue = exists.balance.pastConvertedValue.plus(
                balanceItem.free.pastConvertedValue,
              );
            }
          }
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];

          if (!token) {
            continue;
          }

          const freeBalance: BalanceValueInfo = {
            value: BN_ZERO,
            convertedValue: BN_ZERO,
            pastConvertedValue: BN_ZERO,
          };

          let apy: undefined | number;

          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          const inputAsset = pool.metadata.inputAsset;
          const balanceItem = tokenBalanceMap[inputAsset];

          if (balanceItem) {
            freeBalance.value = freeBalance.value.plus(balanceItem.free.value);
            freeBalance.convertedValue = freeBalance.convertedValue.plus(balanceItem.free.convertedValue);
            freeBalance.pastConvertedValue = freeBalance.pastConvertedValue.plus(balanceItem.free.pastConvertedValue);
          }

          result[group] = {
            group: group,
            token: token.slug,
            maxApy: apy,
            symbol: token.symbol,
            balance: freeBalance,
            isTestnet: chainInfo.isTestnet,
            name: token.name,
            chain: chain,
            poolListLength: 1,
            poolSlugs: [pool.slug],
            assetSlugs: [pool.metadata.inputAsset],
          };
        }
      }
    }

    return Object.values(result);
  }, [assetRegistry, chainInfoMap, chainsByAccountType, multiChainAssetMap, poolInfoMap, tokenBalanceMap]);
};

export default useYieldGroupInfo;
