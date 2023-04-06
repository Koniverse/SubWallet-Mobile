import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchChainState(key: string) {
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);

  return useMemo(() => chainStateMap[key], [chainStateMap, key]);
}
