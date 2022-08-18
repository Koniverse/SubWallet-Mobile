import { useContext, useEffect, useState } from 'react';
import { subscribeSettings } from '../../messaging';
import { updateSettings } from 'stores/updater';
import { ResponseSettingsType } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useStoreSettings(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = !!useSelector((state: RootState) => state.settings.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: settings');
      const _update = (payload: ResponseSettingsType) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeSettings updated');

        updateSettings(payload);
        setStoreStatus('SYNCED');
      };
      subscribeSettings(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeSettings error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
