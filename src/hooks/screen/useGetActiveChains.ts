import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useGetActiveNetwork(): NetworkJson[] {
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo((): NetworkJson[] => {
    const result: NetworkJson[] = [];

    for (const network of Object.values(networkMap)) {
      if (network.active) {
        result.push(network);
      }
    }

    return result;
  }, [networkMap]);
}
