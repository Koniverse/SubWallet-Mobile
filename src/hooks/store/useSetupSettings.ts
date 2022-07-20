import { useEffect } from 'react';
import { subscribeSettings } from '../../messaging';
import { updateSettings } from 'stores/updater';

export default function useSetupSettings(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: settings');

    if (isWebRunnerReady) {
      subscribeSettings(null, updateSettings)
        .then(updateSettings)
        .catch(e => {
          console.log('--- subscribeSettings error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeSettings');
        });
    }
  }, [isWebRunnerReady]);
}
