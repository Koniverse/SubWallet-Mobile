import { _ChainInfo } from '@subwallet/chain-list/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export type ChainInfoWithState = _ChainInfo & _ChainState;

export default function useChainInfoWithState(): Record<string, ChainInfoWithState> {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);

  // const chainInfoList: ChainInfoWithState[] = useMemo(() => {
  //   return Object.values(chainInfoMap).map(item => {
  //     return { ...item, ...(chainStateMap[item.slug] || {}) };
  //   });
  // }, [chainInfoMap, chainStateMap]);

  return useMemo(() => {
    return Object.values(chainInfoMap).reduce(
      (acc, cur) => Object.assign(acc, { [cur.slug]: { ...cur, ...(chainStateMap[cur.slug] || {}) } }),
      {},
    );
  }, [chainInfoMap, chainStateMap]);
}
