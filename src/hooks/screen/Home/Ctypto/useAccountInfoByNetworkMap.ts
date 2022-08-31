import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { AccountInfoByNetwork } from 'types/ui-types';
import reformatAddress from 'utils/index';
import { useMemo } from 'react';

function getAccountInfoByNetwork(address: string, networkKey: string, network: NetworkJson): AccountInfoByNetwork {
  return {
    address,
    key: networkKey,
    networkKey,
    networkDisplayName: network.chain,
    networkPrefix: network.ss58Format,
    networkLogo: networkKey,
    networkIconTheme: network.isEthereum ? 'ethereum' : network.icon || 'polkadot',
    formattedAddress: reformatAddress(address, network.ss58Format),
    isTestnet: network.groups.includes('TEST_NET'),
    nativeToken: network.nativeToken,
  };
}

function getAccountInfoByNetworkMap(
  address: string,
  networkKeys: string[],
  networkMap: Record<string, NetworkJson>,
): Record<string, AccountInfoByNetwork> {
  const result: Record<string, AccountInfoByNetwork> = {};

  networkKeys.forEach(n => {
    if (networkMap[n]) {
      result[n] = getAccountInfoByNetwork(address, n, networkMap[n]);
    }
  });

  return result;
}

export default function useAccountInfoByNetworkMap(
  currentAccountAddress: string,
  showedNetworks: string[],
  networkMap: Record<string, NetworkJson>,
): Record<string, AccountInfoByNetwork> {
  const dep1 = JSON.stringify(showedNetworks);
  const dep2 = JSON.stringify(networkMap);

  return useMemo<Record<string, AccountInfoByNetwork>>(() => {
    return getAccountInfoByNetworkMap(currentAccountAddress, showedNetworks, networkMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountAddress, dep1, dep2]);
}
