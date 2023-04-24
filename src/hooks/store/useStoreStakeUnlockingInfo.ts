import { StakeUnlockingJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';
import { updateStakeUnlockingInfo } from 'stores/updater';
import { clearWebRunnerHandler, subscribeStakeUnlockingInfo } from 'messaging/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreStakeUnlockingInfo() {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.staking.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: stakeUnlockingInfo');

      const _update = (payload: StakeUnlockingJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeStakeUnlockingInfo updated');

        updateStakeUnlockingInfo(payload);
        setStoreStatus('SYNCED');
      };

      subscribeStakeUnlockingInfo(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeStakeUnlockingInfo error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
