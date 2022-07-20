import { useEffect } from 'react';
import { saveCurrentAccountAddress, subscribeAccountsWithCurrentAddress } from '../../messaging';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { updateAccountsAndCurrentAccount } from 'stores/updater';

export default function useSetupAccounts(isWebRunnerReady: boolean): void {
  useEffect((): void => {
    console.log('--- Setup redux: accounts');

    if (isWebRunnerReady) {
      subscribeAccountsWithCurrentAddress(rs => {
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
      })
        .catch(e => {
          console.log('--- subscribeAccountsWithCurrentAddress error:', e);
        })
        .finally(() => {
          console.log('--- Init subscribeAccountsWithCurrentAddress');
        });
    }
  }, [isWebRunnerReady]);
}
