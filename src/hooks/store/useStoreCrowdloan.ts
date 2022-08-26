import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { CrowdloanJson } from '@subwallet/extension-base/background/KoniTypes';
import { updateCrowdloan } from 'stores/updater';
import { subscribeCrowdloan } from '../../messaging';

export default function useStoreCrowdloan(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: crowdloan');

      const _update = (payload: CrowdloanJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribePrice updated');

        updateCrowdloan(payload);
        setStoreStatus('SYNCED');
      };

      subscribeCrowdloan(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeCrowdloan error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
