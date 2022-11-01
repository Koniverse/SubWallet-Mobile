import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { CustomToken, CustomTokenJson } from '@subwallet/extension-base/background/KoniTypes';
import { updateCustomToken } from 'stores/updater';
import { clearWebRunnerHandler, subscribeCustomToken } from '../../messaging';
import { getId } from '@subwallet/extension-base/utils/getId';

export default function useStoreCustomToken(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.customToken.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  const formatData = (payload: CustomTokenJson) => {
    const erc20TokenList = payload.erc20.filter(item => !item.isDeleted);
    const erc721TokenList = payload.erc721.filter(item => !item.isDeleted);
    const data = erc20TokenList.concat(erc721TokenList);
    const obj: Record<string, CustomToken> = data.reduce(
      (acc, cur) => Object.assign(acc, { [`${cur.smartContract}-${cur.chain}-${cur.type}`]: cur }),
      {},
    );
    return obj;
  };

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: evmToken');

      const _update = (payload: CustomTokenJson) => {
        if (cancel) {
          return;
        }
        console.log('--- subscribeEvmToken updated');
        const formattedPayload = formatData(payload);
        updateCustomToken(formattedPayload);
        setStoreStatus('SYNCED');
      };

      subscribeCustomToken(_update, handlerId)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeEvmToken error:', e);
        });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
