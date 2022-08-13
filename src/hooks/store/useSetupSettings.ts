import { useContext, useEffect, useState } from 'react';
import { subscribeSettings } from '../../messaging';
import { updateSettings } from 'stores/updater';
import { ResponseSettingsType } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupSettings(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: settings');
      const _update = (payload: ResponseSettingsType) => {
        if (cancel) {
          return;
        }
        updateSettings(payload);
        setIsReady(true);
      };
      subscribeSettings(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeSettings error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeSettings');
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
