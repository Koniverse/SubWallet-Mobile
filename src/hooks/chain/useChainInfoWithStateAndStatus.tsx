import { _ChainApiStatus, _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
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
    return Object.values(chainInfoWithState).reduce((acc, cur) => {
      const status = chainStatusMap[cur.slug];
      // The background keeps forwarding status events from a destroyed api (it never
      // unsubscribes), so a flapping chain can end up UNSTABLE after being turned off.
      // A chain that is off can only be disconnected.
      const connectionStatus = cur.active ? status?.connectionStatus : _ChainConnectionStatus.DISCONNECTED;

      return Object.assign(acc, { [cur.slug]: { ...cur, ...status, connectionStatus } });
    }, {});
  }, [chainInfoWithState, chainStatusMap]);
}
