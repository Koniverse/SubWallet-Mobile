import { useEffect } from 'react';
import { subscribeChainRegistry } from '../../messaging';
import { updateChainRegistry } from 'stores/updater';

export default function useSetupChainRegistry(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: chainRegistry');

    if (isWebRunnerReady) {
      subscribeChainRegistry(updateChainRegistry)
        .then(updateChainRegistry)
        .catch(e => {
          console.log('--- subscribeChainRegistry error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeChainRegistry');
        });
    }
  }, [isWebRunnerReady]);
}
