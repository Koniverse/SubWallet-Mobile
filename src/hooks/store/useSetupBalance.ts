import { useEffect } from 'react';
import { subscribeBalance } from '../../messaging';
import { updateBalance } from 'stores/updater';

export default function useSetupBalance(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: balance');

    if (isWebRunnerReady) {
      subscribeBalance(null, updateBalance)
        .then(updateBalance)
        .catch(e => {
          console.log('--- subscribeBalance error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeBalance');
        });
    }
  }, [isWebRunnerReady]);
}
