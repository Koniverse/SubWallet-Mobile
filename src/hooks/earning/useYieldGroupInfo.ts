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
import BigN from 'bignumber.js';
import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { _ChainAsset, _MultiChainAsset } from '@subwallet/chain-list/types';
import { BN_TEN } from 'utils/number';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { _getAssetOriginChain } from '@subwallet/extension-base/services/chain-service/utils';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';

const isRelatedToRelayChain = (
  group: string,
  assetRegistry: Record<string, _ChainAsset>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
) => {
  if (assetRegistry[group]) {
    return _STAKING_CHAIN_GROUP.relay.includes(_getAssetOriginChain(assetRegistry[group]));
  }

  if (multiChainAssetMap[group]) {
    const originChainAsset = multiChainAssetMap[group].originChainAsset;

    return _STAKING_CHAIN_GROUP.relay.includes(_getAssetOriginChain(assetRegistry[originChainAsset]));
  }

  return false;
};

function calculateTotalValueStaked(
  poolInfo: YieldPoolInfo,
  assetRegistry: Record<string, _ChainAsset>,
  priceMap: Record<string, number>,
) {
  const asset = assetRegistry[poolInfo.metadata.inputAsset];
  const tvl = poolInfo.statistic?.tvl;

  if (!asset || !asset.priceId || !tvl) {
    return new BigN(0);
  }

  const price = priceMap[asset.priceId] || 0;

  return new BigN(tvl).div(BN_TEN.pow(asset.decimals || 0)).multipliedBy(price);
}

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const chainsByAccountType = useGetChainSlugsByAccount();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap, tokenGroupBalanceMap } = useAccountBalance(tokenGroupMap, true);
  const { priceMap } = useSelector((state: RootState) => state.price);

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
            exists.maxApy = Math.max(exists.maxApy || 0, apy);
          }

          if (pool.statistic?.earningThreshold?.join) {
            if (new BigN(exists.minJoin || 0).gt(pool.statistic?.earningThreshold?.join || '0')) {
              exists.description = pool.metadata.description;
            }
          }

          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
          exists.poolSlugs.push(pool.slug);

          if (exists.isRelatedToRelayChain) {
            if (pool.type === YieldPoolType.NATIVE_STAKING) {
              exists.totalValueStaked = calculateTotalValueStaked(pool, assetRegistry, priceMap);
            }
          } else {
            exists.totalValueStaked = exists.totalValueStaked.plus(
              calculateTotalValueStaked(pool, assetRegistry, priceMap),
            );
          }
        } else {
          const token = multiChainAssetMap[group] || assetRegistry[group];

          if (!token) {
            continue;
          }

          const balance = tokenGroupBalanceMap[group] || tokenBalanceMap[group];
          const freeBalance: BalanceValueInfo = balance?.free || {
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

          const checkRelatedRelaChain = isRelatedToRelayChain(group, assetRegistry, multiChainAssetMap);

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
            description: pool.metadata.description,
            totalValueStaked:
              checkRelatedRelaChain && pool.type !== YieldPoolType.NATIVE_STAKING
                ? BN_ZERO
                : calculateTotalValueStaked(pool, assetRegistry, priceMap),
            minJoin: pool.statistic?.earningThreshold?.join,
            isRelatedToRelayChain: checkRelatedRelaChain,
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
    priceMap,
    tokenBalanceMap,
    tokenGroupBalanceMap,
  ]);
};

export default useYieldGroupInfo;
