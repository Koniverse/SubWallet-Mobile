// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningRewardItem, YieldPoolType } from '@subwallet/extension-base/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_ZERO } from 'utils/chainBalances';
import { findAccountByAddress } from 'utils/index';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';

const useYieldRewardTotal = (slug: string): string | undefined => {
  const { poolInfoMap, earningRewards } = useSelector((state: RootState) => state.earning);
  const { currentAccountProxy, accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const chainsByAccountType = useGetChainSlugsByCurrentAccountProxy();

  return useMemo(() => {
    const checkAddress = (item: EarningRewardItem) => {
      if (isAllAccount) {
        const account = findAccountByAddress(accounts, item.address);

        return !!account;
      } else {
        return currentAccountProxy?.accounts.some(({ address }) => isSameAddress(address, item.address));
      }
    };

    const poolInfo = poolInfoMap[slug];

    if (poolInfo) {
      if (poolInfo.type !== YieldPoolType.NOMINATION_POOL && !_STAKING_CHAIN_GROUP.mythos.includes(poolInfo.chain)) {
        return '0';
      } else {
        if (earningRewards.length) {
          let result = BN_ZERO;

          for (const reward of earningRewards) {
            if (reward.slug === slug && chainsByAccountType.includes(reward.chain) && poolInfoMap[slug]) {
              const isValid = checkAddress(reward);

              if (isValid) {
                result = result.plus(reward.unclaimedReward || '0');
              }
            }
          }

          return result.toString();
        } else {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }, [accounts, chainsByAccountType, currentAccountProxy?.accounts, earningRewards, isAllAccount, poolInfoMap, slug]);
};

export default useYieldRewardTotal;
