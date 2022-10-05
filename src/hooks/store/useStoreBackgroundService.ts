import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { updateBackgroundServiceActiveState } from 'stores/updater';
import { subscribeActiveCronAndSubscriptionServiceMap } from '../../messaging';
import { ActiveCronAndSubscriptionMap } from 'types/background';

export default function useStoreBackgroundService(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

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

      subscribeActiveCronAndSubscriptionServiceMap(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeActiveCronAndSubscriptionServiceMap error:', e);
        });
    }
    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
