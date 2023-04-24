import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { CrowdloanJson } from '@subwallet/extension-base/background/KoniTypes';
import { updateCrowdloan } from 'stores/updater';
import { clearWebRunnerHandler, subscribeCrowdloan } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreCrowdloan(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.crowdloan.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: crowdloan');

      const _update = (payload: CrowdloanJson) => {
        if (cancel) {
          return;
        }

        if (storeStatus === 'CACHED' && payload.reset) {
          return;
        }

        console.log('--- subscribeCrowdloan updated');

        updateCrowdloan(payload);
        setStoreStatus('SYNCED');
      };

      subscribeCrowdloan(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeCrowdloan error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady, storeStatus]);

  return storeStatus;
}
