import { useContext, useEffect, useState } from 'react';
import { updateNetworkMap } from 'stores/updater';
import { subscribeNetworkMap } from '../../messaging';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';

export default function useStoreNetworkMap(): StoreStatus {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const isCached = useSelector((state: RootState) => state.networkMap.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: networkMap');

      const _update = (payload: Record<string, NetworkJson>) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeNetworkMap success');

        updateNetworkMap(payload);
        setStoreStatus('SYNCED');
      };

      subscribeNetworkMap(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNetworkMap error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
