import { useContext, useEffect, useState } from 'react';
import { clearWebRunnerHandler, subscribePrice } from 'messaging/index';
import { updatePrice } from 'stores/updater';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStorePrice(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: price');

      const _update = (payload: PriceJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribePrice updated');

        updatePrice(payload);
        setStoreStatus('SYNCED');
      };

      subscribePrice(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribePrice error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
