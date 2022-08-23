import { useContext, useEffect, useState } from 'react';
import { subscribeBalance } from '../../messaging';
import { updateBalance } from 'stores/updater';
import { BalanceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useStoreBalance(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.balance.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: balance');

      const _update = (payload: BalanceJson) => {
        if (cancel) {
          return;
        }

        // Not apply first result if get cached
        if (storeStatus === 'CACHED' && payload.reset) {
          return;
        }

        console.log('--- subscribeBalance updated');

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
  }, [isWebRunnerReady, storeStatus]);

  return storeStatus;
}
