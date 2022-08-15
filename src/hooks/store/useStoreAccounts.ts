import { useContext, useEffect, useState } from 'react';
import { saveCurrentAccountAddress, subscribeAccountsWithCurrentAddress } from '../../messaging';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { updateAccountsAndCurrentAccount } from 'stores/updater';
import { WebViewContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';

export default function useStoreAccounts(): StoreStatus {
  const isWebRunnerReady = useContext(WebViewContext).isReady;
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('INIT');

  useEffect(() => {
    let cancel = false;

    if (isWebRunnerReady) {
      console.log('--- Setup redux: accounts');

      subscribeAccountsWithCurrentAddress(rs => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeAccountsWithCurrentAddress success');

        const { accounts, currentAddress, currentGenesisHash } = rs;

        if (accounts && accounts.length) {
          let selectedAcc = accounts.find(acc => acc.address === currentAddress);

          if (!selectedAcc) {
            selectedAcc = accounts[0];
            selectedAcc.genesisHash = currentGenesisHash;

            const accountInfo = {
              address: selectedAcc.address,
              currentGenesisHash,
            } as CurrentAccountInfo;

            saveCurrentAccountAddress(accountInfo, () => {
              updateAccountsAndCurrentAccount({
                accounts,
                currentAccountAddress: (selectedAcc as AccountJson).address,
              });
            }).catch(e => {
              console.error('There is a problem when set Current Account', e);
            });
          } else {
            selectedAcc.genesisHash = currentGenesisHash;
            updateAccountsAndCurrentAccount({ accounts, currentAccountAddress: selectedAcc.address });
          }
        }

        setStoreStatus('SYNCED');
      }).catch(e => {
        console.log('--- subscribeAccountsWithCurrentAddress error:', e);
      });
    }

    return () => {
      cancel = true;
    };
  }, [isWebRunnerReady]);

  return storeStatus;
}
