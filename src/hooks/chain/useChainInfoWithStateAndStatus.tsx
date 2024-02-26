import { _ChainApiStatus } from '@subwallet/extension-base/services/chain-service/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useChainInfoWithState, { ChainInfoWithState } from 'hooks/chain/useChainInfoWithState';

export type ChainInfoWithStateAnhStatus = ChainInfoWithState & _ChainApiStatus;

export default function useChainInfoWithStateAndStatus(
  { filterStatus = true } = {} as { filterStatus?: boolean },
): Record<string, ChainInfoWithStateAnhStatus> {
  const chainInfoWithState = useChainInfoWithState({ filterStatus });
  const chainStatusMap = useSelector((state: RootState) => state.chainStore.chainStatusMap);

  return useMemo(() => {
    return Object.values(chainInfoWithState).reduce(
      (acc, cur) => Object.assign(acc, { [cur.slug]: { ...cur, ...chainStatusMap[cur.slug] } }),
      {},
    );
  }, [chainInfoWithState, chainStatusMap]);
}
