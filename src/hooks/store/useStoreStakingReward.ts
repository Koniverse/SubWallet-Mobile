import { StakingRewardJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';
import { updateStakingReward } from 'stores/updater';
import { clearWebRunnerHandler, subscribeStakingReward } from 'messaging/index';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreStakingReward(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.staking.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: stakingReward');

      const _update = (payload: StakingRewardJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeStakingReward updated');

        updateStakingReward(payload);
        setStoreStatus('SYNCED');
      };

      subscribeStakingReward(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeStakingReward error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);
  return storeStatus;
}
