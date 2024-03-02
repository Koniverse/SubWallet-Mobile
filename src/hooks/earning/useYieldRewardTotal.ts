// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EarningRewardItem, YieldPoolType } from '@subwallet/extension-base/types';
import { isAccountAll, isSameAddress } from '@subwallet/extension-base/utils';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_ZERO } from 'utils/chainBalances';
import { findAccountByAddress } from 'utils/index';

const useYieldRewardTotal = (slug: string): string | undefined => {
  const { poolInfoMap, earningRewards } = useSelector((state: RootState) => state.earning);
  const { currentAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const chainsByAccountType = useGetChainSlugs();

  return useMemo(() => {
    const address = currentAccount?.address || '';
    const isAll = isAccountAll(address);

    const checkAddress = (item: EarningRewardItem) => {
      if (isAll) {
        const account = findAccountByAddress(accounts, item.address);

        return !!account;
      } else {
        return isSameAddress(address, item.address);
      }
    };

    const poolInfo = poolInfoMap[slug];

    if (poolInfo) {
      if (poolInfo.type !== YieldPoolType.NOMINATION_POOL) {
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
  }, [accounts, chainsByAccountType, currentAccount?.address, earningRewards, poolInfoMap, slug]);
};

export default useYieldRewardTotal;
