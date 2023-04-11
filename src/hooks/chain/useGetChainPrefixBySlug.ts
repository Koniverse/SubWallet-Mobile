import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useGetChainPrefixBySlug = (chain?: string): number => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  return useMemo(() => {
    if (!chain) {
      return 42;
    }

    return chainInfoMap[chain]?.substrateInfo?.addressPrefix ?? 42;
  }, [chain, chainInfoMap]);
};

export default useGetChainPrefixBySlug;
