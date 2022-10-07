import { StakingJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { StoreStatus } from 'stores/types';
import { updateStaking } from 'stores/updater';
import { subscribeStaking } from '../../messaging';
import { useContext, useEffect, useState } from 'react';
import { RootState } from 'stores/index';

export default function useStoreStaking(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.staking.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;

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

      subscribeStaking(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeStaking error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
