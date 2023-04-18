import { useContext, useEffect, useState } from 'react';
import { updateNft } from 'stores/updater';
import { clearWebRunnerHandler, subscribeNft } from 'messaging/index';
import { NftJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreNft(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.nftCollection.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: networkMap');

      const _update = (payload: NftJson) => {
        // todo: currently payload may be undefined, need to investigate in web-runner
        if (cancel || !payload) {
          return;
        }

        console.log('--- subscribeNft updated');

        updateNft(payload);
        setStoreStatus('SYNCED');
      };

      subscribeNft(null, _update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNft error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
