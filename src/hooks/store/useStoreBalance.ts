import { useContext, useEffect, useState } from 'react';
import { subscribeBalance } from '../../messaging';
import { updateBalance } from 'stores/updater';
import { BalanceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';

export default function useStoreBalance(): StoreStatus {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: balance');

      const _update = (payload: BalanceJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeBalance success');

        updateBalance(payload);
        setStoreStatus('SYNCED');
      };
      subscribeBalance(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeBalance error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
