import { StoreStatus } from 'stores/types';
import { useState } from 'react';

export default function useStoreBackgroundService(): StoreStatus {
  const [storeStatus] = useState<StoreStatus>('INIT');

  // useEffect(() => {
  //   let cancel = false;
  //   const handlerId = getId();
  //
  //   if (isWebRunnerReady) {
  //     console.log('--- Setup redux: activeBackgroundService');
  //
  //     const _update = (payload: ActiveCronAndSubscriptionMap) => {
  //       if (cancel) {
  //         return;
  //       }
  //
  //       console.log('--- subscribeActiveCronAndSubscriptionServiceMap updated', payload);
  //
  //       updateBackgroundServiceActiveState(payload);
  //       setStoreStatus('SYNCED');
  //     };
  //
  //     subscribeActiveCronAndSubscriptionServiceMap(_update, handlerId)
  //       .then(_update)
  //       .catch(e => {
  //         console.log('--- subscribeActiveCronAndSubscriptionServiceMap error:', e);
  //       });
  //   }
  //   return () => {
  //     cancel = true;
  //     clearWebRunnerHandler(handlerId);
  //   };
  // }, [isWebRunnerReady]);

  return storeStatus;
}
