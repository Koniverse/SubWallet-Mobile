import { useContext, useEffect, useState } from 'react';
import { subscribePrice } from '../../messaging';
import { updatePrice } from 'stores/updater';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupPrice(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: price');
      const _update = (payload: PriceJson) => {
        if (cancel) {
          return;
        }
        updatePrice(payload);
        setIsReady(true);
      };
      subscribePrice(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribePrice error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribePrice');
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
