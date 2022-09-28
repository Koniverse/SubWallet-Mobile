import { StoreStatus } from 'stores/types';
import { useContext, useEffect, useState } from 'react';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { CustomEvmToken, EvmTokenJson } from '@subwallet/extension-base/background/KoniTypes';
import { updateEvmToken } from 'stores/updater';
import { subscribeEvmToken } from '../../messaging';

export default function useStoreEvmToken(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isCached = useSelector((state: RootState) => state.evmToken.isReady);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(isCached ? 'CACHED' : 'INIT');

  const formatData = (payload: EvmTokenJson) => {
    const erc20TokenList = payload.erc20.filter(item => !item.isDeleted);
    const erc721TokenList = payload.erc721.filter(item => !item.isDeleted);
    const data = erc20TokenList.concat(erc721TokenList);
    const obj: Record<string, CustomEvmToken> = data.reduce((acc, cur) => ({ ...acc, [cur.smartContract]: cur }), {});
    return obj;
  };

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: evmToken');

      const _update = (payload: EvmTokenJson) => {
        if (cancel) {
          return;
        }
        console.log('--- subscribeEvmToken updated');
        const formattedPayload = formatData(payload);
        updateEvmToken(formattedPayload);
        setStoreStatus('SYNCED');
      };

      subscribeEvmToken(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeEvmToken error:', e);
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
