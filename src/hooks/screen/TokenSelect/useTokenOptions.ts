import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getTokenItemOptions } from 'utils/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useMemo } from 'react';
import { TokenItemType } from 'types/ui-types';

export default function useTokenOptions(address: string, filteredNetworkKey?: string): TokenItemType[] {
  const { chainRegistry: chainRegistryMap, networkMap } = useSelector((state: RootState) => state);

  const tokenOptionsType = isAccountAll(address) ? 'ALL' : isEthereumAddress(address) ? 'ETHEREUM' : 'SUBSTRATE';
  const dep1 = JSON.stringify(chainRegistryMap);
  const dep2 = JSON.stringify(networkMap);

  return useMemo<TokenItemType[]>(() => {
    return getTokenItemOptions(chainRegistryMap, networkMap, tokenOptionsType, filteredNetworkKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, filteredNetworkKey, tokenOptionsType]);
}
