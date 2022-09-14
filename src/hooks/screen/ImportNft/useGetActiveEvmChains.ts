import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Item } from 'react-native-picker-select';

export default function useGetActiveEvmChains(): Item[] {
  const { networkMap } = useSelector((state: RootState) => state);

  return useMemo((): Item[] => {
    const result: Item[] = [];

    for (const [key, network] of Object.entries(networkMap.details)) {
      if (network.isEthereum && network.active) {
        result.push({
          label: network.chain,
          value: key,
        });
      }
    }

    if (result.length === 0) {
      return [
        {
          label: 'Please enable at least 1 Ethereum compatible network',
          value: '',
        },
      ];
    }

    return result;
  }, [networkMap.details]);
}
