import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useMemo } from 'react';
import { TokenItemType } from 'types/ui-types';
import { ChainRegistry, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';

function getTokenItemOptions(
  networkKeys: string[],
  networkMap: Record<string, NetworkJson>,
  chainRegistryMap: Record<string, ChainRegistry>,
  filteredNetworkKey?: string,
): TokenItemType[] {
  const options: TokenItemType[] = [];
  const _networkKeys: string[] = [];

  if (filteredNetworkKey) {
    _networkKeys.push(filteredNetworkKey);
  } else {
    _networkKeys.push(...networkKeys);
  }

  _networkKeys.forEach(networkKey => {
    if (!chainRegistryMap[networkKey] || !networkMap[networkKey]) {
      return;
    }

    Object.keys(chainRegistryMap[networkKey].tokenMap).forEach(token => {
      const tokenInfo = chainRegistryMap[networkKey].tokenMap[token];

      options.push({
        networkKey: networkKey,
        networkDisplayName: networkMap[networkKey].chain.replace(' Relay Chain', ''),
        symbol: tokenInfo.symbol,
        displayedSymbol: tokenInfo.symbolAlt || tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        isMainToken: tokenInfo.isMainToken,
        specialOption: tokenInfo?.specialOption,
      });
    });
  });

  return options;
}

export default function useTokenOptions(address: string, filteredNetworkKey?: string): TokenItemType[] {
  const {
    chainRegistry: chainRegistryMap,
    networkMap,
    accounts: { accounts },
  } = useSelector((state: RootState) => state);

  const showedNetwork = useShowedNetworks(address, accounts);

  const dep1 = JSON.stringify(showedNetwork);
  const dep2 = JSON.stringify(networkMap);
  const dep3 = JSON.stringify(chainRegistryMap);

  return useMemo<TokenItemType[]>(() => {
    return getTokenItemOptions(showedNetwork, networkMap, chainRegistryMap, filteredNetworkKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, dep3, filteredNetworkKey]);
}
