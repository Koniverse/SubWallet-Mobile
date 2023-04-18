import { useContext, useEffect, useState } from 'react';
import { clearWebRunnerHandler, subscribeHistory } from 'messaging/index';
import { updateTransactionHistory } from 'stores/updater';
import { TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreTransactionHistory(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: transactionHistory');

      const _update = (payload: Record<string, TransactionHistoryItemType[]>) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeHistory updated');

        updateTransactionHistory(payload);
        setStoreStatus('SYNCED');
      };

      subscribeHistory(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeHistory error:', e);
        });
    }
    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
