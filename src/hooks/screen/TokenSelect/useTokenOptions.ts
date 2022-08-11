import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getAccountType, getTokenItemOptions } from 'utils/index';
import { useMemo } from 'react';
import { AccountType, TokenItemType } from 'types/ui-types';

export default function useTokenOptions(address: string, filteredNetworkKey?: string): TokenItemType[] {
  const { chainRegistry: chainRegistryMap, networkMap } = useSelector((state: RootState) => state);

  const accountType: AccountType = getAccountType(address);
  const dep1 = JSON.stringify(chainRegistryMap);
  const dep2 = JSON.stringify(networkMap);

  return useMemo<TokenItemType[]>(() => {
    return getTokenItemOptions(chainRegistryMap, networkMap, accountType, filteredNetworkKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, filteredNetworkKey, accountType]);
}
