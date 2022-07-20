import { useEffect } from 'react';
import { subscribeHistory } from '../../messaging';
import { updateTransactionHistory } from 'stores/updater';

export default function useSetupTransactionHistory(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: transactionHistory');

    if (isWebRunnerReady) {
      subscribeHistory(updateTransactionHistory)
        .then(updateTransactionHistory)
        .catch(e => {
          console.log('--- subscribeHistory error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeHistory');
        });
    }
  }, [isWebRunnerReady]);
}
