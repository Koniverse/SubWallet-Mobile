import React from 'react';
import { View } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { AccountInfoByNetwork } from 'types/ui-types';
import { reformatAddress } from '@subwallet/extension-koni-base/utils/utils';
import { getNetworkLogo } from 'utils/index';

interface Props {
  address: string;
  networkKeys: string[];
  networkMetadataMap: Record<string, NetWorkMetadataDef>;
}

function getAccountInfoByNetwork(
  address: string,
  networkKey: string,
  networkMetadata: NetWorkMetadataDef,
): AccountInfoByNetwork {
  return {
    address,
    key: networkKey,
    networkKey,
    networkDisplayName: networkMetadata.chain,
    networkPrefix: networkMetadata.ss58Format,
    networkLogo: networkKey,
    networkIconTheme: networkMetadata.isEthereum ? 'ethereum' : networkMetadata.icon || 'polkadot',
    formattedAddress: address,
  };
}

function getAccountInfoByNetworkMap(
  address: string,
  networkKeys: string[],
  networkMetadataMap: Record<string, NetWorkMetadataDef>,
): Record<string, AccountInfoByNetwork> {
  const result: Record<string, AccountInfoByNetwork> = {};

  networkKeys.forEach(n => {
    if (networkMetadataMap[n]) {
      result[n] = getAccountInfoByNetwork(address, n, networkMetadataMap[n]);
    }
  });

  return result;
}

export const ChainsTab = ({ address, networkKeys, networkMetadataMap }: Props) => {
  const accountInfoByNetworkMap: Record<string, AccountInfoByNetwork> = getAccountInfoByNetworkMap(
    address,
    networkKeys,
    networkMetadataMap,
  );

  const renderChainBalanceItem = (networkKey: string) => {
    const info = accountInfoByNetworkMap[networkKey];

    return <ChainBalance key={info.key} accountInfo={info} isLoading={false} />;
  };

  return <View style={{ paddingTop: 8 }}>{networkKeys.map(key => renderChainBalanceItem(key))}</View>;
};
