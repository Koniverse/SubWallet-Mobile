import { StakingJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { StoreStatus } from 'stores/types';
import { updateStaking } from 'stores/updater';
import { clearWebRunnerHandler, subscribeStaking } from 'messaging/index';
import { useContext, useEffect, useState } from 'react';
import { RootState } from 'stores/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreStaking(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.staking.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: staking');

      const _update = (payload: StakingJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeStaking updated');

        updateStaking(payload);
        setStoreStatus('SYNCED');
      };

      subscribeStaking(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeStaking error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
