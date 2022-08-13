import { useContext, useEffect, useState } from 'react';
import { subscribeBalance } from '../../messaging';
import { updateBalance } from 'stores/updater';
import { BalanceJson } from '@subwallet/extension-base/background/KoniTypes';
import { WebViewContext } from 'providers/contexts';

export default function useSetupBalance(): boolean {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: balance');
      const _update = (payload: BalanceJson) => {
        if (cancel) {
          return;
        }
        updateBalance(payload);
        setIsReady(true);
      };
      subscribeBalance(null, _update)
        .then(_update)
        .catch(e => {
          console.log('--- subscribeBalance error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeBalance');
        });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return isReady;
}
