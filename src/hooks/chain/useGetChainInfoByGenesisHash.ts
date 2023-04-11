import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findChainInfoByGenesisHash } from 'utils/chain';

const useGetChainInfoByGenesisHash = (genesisHash?: string) => {
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  return useMemo(() => findChainInfoByGenesisHash(chainInfoMap, genesisHash), [chainInfoMap, genesisHash]);
};

export default useGetChainInfoByGenesisHash;
