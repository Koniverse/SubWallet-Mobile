import { useContext, useEffect, useState } from 'react';
import { updateNetworkMap } from 'stores/updater';
import { subscribeNetworkMap } from '../../messaging';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupNetworkMap(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: networkMap');
      const _update = (payload: Record<string, NetworkJson>) => {
        if (cancel) {
          return;
        }

        updateNetworkMap(payload);
        setIsReady(true);
      };
      subscribeNetworkMap(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeNetworkMap error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeNetworkMap');
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
