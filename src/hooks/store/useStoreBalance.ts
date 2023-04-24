import { useContext, useEffect, useState } from 'react';
import { clearWebRunnerHandler, subscribeBalance } from 'messaging/index';
import { updateBalance } from 'stores/updater';
import { BalanceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreBalance(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.balance.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

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
      subscribeBalance(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeBalance error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady, storeStatus]);

  return storeStatus;
}
