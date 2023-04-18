import { AuthUrlsSlice, StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateAuthUrls } from 'stores/updater';
import { clearWebRunnerHandler, subscribeAuthUrl } from 'messaging/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreAuthUrls(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.authUrls.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: authUrls');

      const _update = (payload: AuthUrlsSlice['details']) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeAuthUrl updated');

        updateAuthUrls(payload);
        setStoreStatus('SYNCED');
      };

      subscribeAuthUrl(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeAuthUrl error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
