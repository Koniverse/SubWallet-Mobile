import { useContext, useEffect, useState } from 'react';
import { updateNft } from 'stores/updater';
import { subscribeNft } from '../../messaging';
import { NftJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoreStatus } from 'stores/types';

export default function useStoreNft(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.nftCollection.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: networkMap');

      const _update = (payload: NftJson) => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeNft updated');

        updateNft(payload);
        setStoreStatus('SYNCED');
      };

      subscribeNft(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNft error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
