import { NETWORK_STATUS, NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useGetNetworkMetadata(): Record<string, NetWorkMetadataDef> {
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo((): Record<string, NetWorkMetadataDef> => {
    const result: Record<string, NetWorkMetadataDef> = {};
    Object.entries(networkMap).forEach(([networkKey, network]) => {
      const { active, apiStatus, chain, genesisHash, groups, icon, isEthereum, paraId, ss58Format } = network;
      let isAvailable = true;

      if (!genesisHash || genesisHash.toLowerCase() === 'unknown') {
        isAvailable = false;
      }

      result[networkKey] = {
        chain,
        networkKey,
        genesisHash,
        icon: isEthereum ? 'ethereum' : icon || 'polkadot',
        ss58Format,
        groups,
        isEthereum: !!isEthereum,
        paraId,
        isAvailable,
        active,
        apiStatus: apiStatus || NETWORK_STATUS.DISCONNECTED,
      };
    });

    return result;
  }, [networkMap]);
}
