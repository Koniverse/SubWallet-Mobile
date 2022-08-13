import { useContext, useEffect, useState } from 'react';
import { subscribeChainRegistry } from '../../messaging';
import { updateChainRegistry } from 'stores/updater';
import { ChainRegistry } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupChainRegistry(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: chainRegistry');
      const _update = (payload: Record<string, ChainRegistry>) => {
        if (cancel) {
          return;
        }
        updateChainRegistry(payload);
        setIsReady(true);
      };
      subscribeChainRegistry(_update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeChainRegistry error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeChainRegistry');
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
