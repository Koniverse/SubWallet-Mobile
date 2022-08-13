import { useContext, useEffect, useState } from 'react';
import { subscribeHistory } from '../../messaging';
import { updateTransactionHistory } from 'stores/updater';
import { TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupTransactionHistory(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: transactionHistory');
      const _update = (payload: Record<string, TransactionHistoryItemType[]>) => {
        if (cancel) {
          return;
        }
        updateTransactionHistory(payload);
        setIsReady(true);
      };
      subscribeHistory(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeHistory error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeHistory');
        });
    }
    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
