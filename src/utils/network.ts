import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getEvmChainId,
  _getSubstrateGenesisHash,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';

export const getNetworkJsonByGenesisHash = (
  networkMap: Record<string, NetworkJson>,
  hash?: string | null,
  forceEthereum?: boolean,
): NetworkJson | null => {
  if (!hash) {
    return null;
  }

  const networks = Object.values(networkMap);

  const filtered = networks.filter(network => network.genesisHash.toLowerCase().includes(hash.toLowerCase()));

  if (filtered.length === 1) {
    return filtered[0];
  } else if (filtered.length > 1) {
    return filtered.find(network => !!network.isEthereum === !!forceEthereum) || null;
  }

  return null;
};

export const getNetworkJsonByInfo = (chainMap: Record<string, _ChainInfo>, isEthereumAddress: boolean, isEthereumNetwork: boolean, info?: string | null | number): _ChainInfo | null => {
  if (!info) {
    if (isEthereumNetwork) {
      const networks = Object.values(chainMap).filter(_isChainEvmCompatible);

      return networks[0];
    }

    return null;
  }

  const networks = Object.values(chainMap);

  for (const chain of networks) {
    if (isEthereumNetwork) {
      if (_getEvmChainId(chain) === info) {
        return chain;
      }
    } else {
      if (_getSubstrateGenesisHash(chain) && !_isChainEvmCompatible(chain)) {
        return chain;
      }
    }
  }

  return null;
};
