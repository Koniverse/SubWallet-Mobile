import { useContext, useEffect, useState } from 'react';
import { updateNetworkMap } from 'stores/updater';
import { clearWebRunnerHandler, subscribeNetworkMap } from 'messaging/index';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import { addLazy, removeLazy } from '@subwallet/extension-base/utils/lazy';

export default function useStoreNetworkMap(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.networkMap.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: networkMap');

      const _update = (payload: Record<string, NetworkJson>) => {
        if (cancel) {
          return;
        }

        addLazy('subscribeNetworkMap', () => {
          console.log('--- subscribeNetworkMap updated');
          updateNetworkMap(payload);
          setStoreStatus('SYNCED');
        });
      };

      subscribeNetworkMap(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNetworkMap error:', e);
        });
    }

    return () => {
      cancel = true;
      removeLazy('subscribeNetworkMap');
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
