import { useEffect } from 'react';
import { subscribePrice } from '../../messaging';
import { updatePrice } from 'stores/updater';

export default function useSetupPrice(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: price');

    if (isWebRunnerReady) {
      subscribePrice(null, updatePrice)
        .then(updatePrice)
        .catch(e => {
          console.log('--- subscribePrice error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribePrice');
        });
    }
  }, [isWebRunnerReady]);
}
