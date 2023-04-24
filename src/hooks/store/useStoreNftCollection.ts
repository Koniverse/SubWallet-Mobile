import { useContext, useEffect, useState } from 'react';
import { updateNftCollection } from 'stores/updater';
import { clearWebRunnerHandler, subscribeNftCollection } from 'messaging/index';
import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreNftCollection(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.nftCollection.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: nftCollection');

      const _update = (payload: NftCollection[]) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeNftCollection updated', payload);

        updateNftCollection({
          ready: true,
          nftCollectionList: payload,
        });
        setStoreStatus('SYNCED');
      };

      subscribeNftCollection(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNftCollection error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
