import { useContext, useEffect } from 'react';
import {
  clearWebRunnerHandler,
  subscribeAccountsWithCurrentAddress,
  updateCurrentAccountAddress,
} from 'messaging/index';
import { updateAccountsAndCurrentAccount, updateAccountsSlice, updateAccountsWaitingStatus } from 'stores/updater';
import { WebRunnerContext } from 'providers/contexts';
import { StoreStatus } from 'stores/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getId } from '@subwallet/extension-base/utils/getId';

function getStatus(isReady: boolean | undefined, isWaiting: boolean | undefined): StoreStatus {
  if (isReady) {
    if (isWaiting) {
      return 'WAITING';
    } else {
      return 'SYNCED';
    }
  }

  return 'INIT';
}

export default function useStoreAccounts(): StoreStatus {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const isReady = useSelector((state: RootState) => state.accountState.isReady);
  const isWaiting = useSelector((state: RootState) => state.accountState.isWaiting);

  useEffect(() => {
    let cancel = false;
    const handlerId = getId();

    if (isWebRunnerReady) {
      console.log('--- Setup redux: accounts');

      subscribeAccountsWithCurrentAddress(rs => {
        if (cancel) {
          return;
        }

        console.log('--- subscribeAccountsWithCurrentAddress updated');

        const { accounts, currentAddress, currentGenesisHash } = rs;

        if (accounts && accounts.length) {
          let selectedAcc = accounts.find(acc => acc.address === currentAddress);

          if (!selectedAcc) {
            updateAccountsWaitingStatus(true);
            selectedAcc = accounts[0];

            updateCurrentAccountAddress(selectedAcc.address).catch(e => {
              console.error('There is a problem when set Current Account', e);
            });
          } else {
            selectedAcc.genesisHash = currentGenesisHash;
            updateAccountsAndCurrentAccount({ accounts, currentAccountAddress: selectedAcc.address });
          }
        } else {
          updateAccountsSlice({ accounts: [], currentAccountAddress: ALL_ACCOUNT_KEY });
        }
      }, handlerId).catch(e => {
        console.log('--- subscribeAccountsWithCurrentAddress error:', e);
      });
    }

    return () => {
      cancel = true;
      clearWebRunnerHandler(handlerId);
    };
  }, [isWebRunnerReady]);

  return getStatus(isReady, isWaiting);
}
