import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findAccountByAddress } from 'utils/account';
import { AccountJson } from '@subwallet/extension-base/background/types';

export default function useGetAccountsByStaking(chain: string, stakingType: StakingType): AccountJson[] {
  const stakingItems = useSelector((state: RootState) => state.staking.stakingMap);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  return useMemo(() => {
    const accountInfos: AccountJson[] = [];

    stakingItems.forEach(stakingItem => {
      if (stakingItem.chain === chain && stakingItem.type === stakingType) {
        accountInfos.push({ address: stakingItem.address });
      }
    });

    accountInfos.forEach(accountInfo => {
      const accountJson = findAccountByAddress(accounts, accountInfo.address);

      if (accountJson) {
        accountInfo.name = accountJson.name;
        accountInfo.type = accountJson.type;
      }
    });

    return accountInfos;
  }, [accounts, chain, stakingItems, stakingType]);
}
