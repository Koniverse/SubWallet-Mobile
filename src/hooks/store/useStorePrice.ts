import { useContext, useEffect, useState } from 'react';
import { subscribePrice } from '../../messaging';
import { updatePrice } from 'stores/updater';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';

export default function useStorePrice(): StoreStatus {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

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

      subscribePrice(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribePrice error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
