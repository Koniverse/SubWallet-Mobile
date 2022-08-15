import { useContext, useEffect, useState } from 'react';
import { subscribeHistory } from '../../messaging';
import { updateTransactionHistory } from 'stores/updater';
import { TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';

export default function useStoreTransactionHistory(): StoreStatus {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: transactionHistory');

      const _update = (payload: Record<string, TransactionHistoryItemType[]>) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeHistory success');

        updateTransactionHistory(payload);
        setStoreStatus('SYNCED');
      };

      subscribeHistory(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeHistory error:', e);
        });
    }
    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
