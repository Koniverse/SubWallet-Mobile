// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { SUNSETTED_YIELD_POOL_SLUGS } from '@subwallet/extension-base/services/earning-service/constants';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceValueInfo } from 'types/balance';
import { YieldGroupInfo } from 'types/earning';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { AccountProxyType, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';
import { getTransactionActionsByAccountProxy } from 'utils/account/account';
import { getExtrinsicTypeByPoolInfo } from 'utils/earning';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const poolInfoMap = useSelector((state: RootState) => state.earning.poolInfoMap);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainsByAccountType = useGetChainSlugsByCurrentAccountProxy();
  const { accountProxies, currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true);

  // A multisig account cannot sign every earning extrinsic (liquid staking and lending
  // are not in its action list), so pools it could never enter must not be offered.
  const extrinsicTypeSupported = useMemo(() => {
    if (!currentAccountProxy) {
      return null;
    }

    return getTransactionActionsByAccountProxy(currentAccountProxy, accountProxies);
  }, [accountProxies, currentAccountProxy]);

  const hasWatchOnlyAccount = useMemo(() => {
    if (!currentAccountProxy) {
      return false;
    }

    if (isAccountAll(currentAccountProxy.id)) {
      return accountProxies.some(item => item.accountType === AccountProxyType.READ_ONLY);
    }

    return currentAccountProxy.accountType === AccountProxyType.READ_ONLY;
  }, [accountProxies, currentAccountProxy]);

  return useMemo(() => {
    const result: Record<string, YieldGroupInfo> = {};

    for (const pool of Object.values(poolInfoMap)) {
      if (SUNSETTED_YIELD_POOL_SLUGS.includes(pool.slug)) {
        continue;
      }

      const chain = pool.chain;
      const extrinsicType = getExtrinsicTypeByPoolInfo(pool);

      if (!hasWatchOnlyAccount && extrinsicTypeSupported && !extrinsicTypeSupported.includes(extrinsicType)) {
        continue;
      }

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
  }, [
    assetRegistry,
    chainInfoMap,
    chainsByAccountType,
    extrinsicTypeSupported,
    hasWatchOnlyAccount,
    multiChainAssetMap,
    poolInfoMap,
    tokenBalanceMap,
  ]);
};

export default useYieldGroupInfo;
