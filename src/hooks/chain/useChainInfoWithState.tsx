import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export type ChainInfoWithState = _ChainInfo & _ChainState;

export default function useChainInfoWithState(
  { filterStatus = true } = {} as { filterStatus?: boolean },
): ChainInfoWithState[] {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);

  return useMemo(() => {
    const rs = Object.values(chainInfoMap).map(item => {
      return { ...item, ...(chainStateMap[item.slug] || {}) };
    });

    if (filterStatus) {
      return rs.filter(item => item.chainStatus === _ChainStatus.ACTIVE);
    } else {
      return rs;
    }
  }, [chainInfoMap, chainStateMap, filterStatus]);
}
