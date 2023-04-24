import { useContext, useEffect, useState } from 'react';
import { clearWebRunnerHandler, subscribeSettings } from 'messaging/index';
import { updateSettings } from 'stores/updater';
import { UiSettings } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreSettings(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = !!useSelector((state: RootState) => state.settings.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: settings');
      const _update = (payload: UiSettings) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeSettings updated');

        updateSettings(payload);
        setStoreStatus('SYNCED');
      };
      subscribeSettings(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeSettings error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
