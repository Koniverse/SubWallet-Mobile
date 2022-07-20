import { useEffect } from 'react';
import { updateNetworkMap } from 'stores/updater';
import { subscribeNetworkMap } from '../../messaging';

export default function useSetupNetworkMap(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: networkMap');

    if (isWebRunnerReady) {
      subscribeNetworkMap(updateNetworkMap)
        .then(updateNetworkMap)
        .catch(e => {
          console.log('--- subscribeNetworkMap error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeNetworkMap');
        });
    }
  }, [isWebRunnerReady]);
}
