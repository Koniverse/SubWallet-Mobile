import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { updateBackgroundServiceActiveState } from 'stores/updater';
import { clearWebRunnerHandler, subscribeActiveCronAndSubscriptionServiceMap } from '../../messaging';
import { ActiveCronAndSubscriptionMap } from '@subwallet/extension-base/background/KoniTypes';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreBackgroundService(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: activeBackgroundService');

      const _update = (payload: ActiveCronAndSubscriptionMap) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeActiveCronAndSubscriptionServiceMap updated', payload);

        updateBackgroundServiceActiveState(payload);
        setStoreStatus('SYNCED');
      };

      subscribeActiveCronAndSubscriptionServiceMap(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeActiveCronAndSubscriptionServiceMap error:', e);
        });
    }
    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
