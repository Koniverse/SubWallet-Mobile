import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Item } from 'react-native-picker-select';

export default function useGetContractSupportedChains(): Item[] {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return useMemo((): Item[] => {
    const result: Item[] = [];

    for (const [key, network] of Object.entries(networkMap)) {
      if (network.active && network.supportSmartContract && network.supportSmartContract.length > 0) {
        result.push({
          label: network.chain,
          value: key,
        });
      }
    }

    return result;
  }, [networkMap]);
}
