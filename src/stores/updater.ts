import { CurrentNetworkInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { store } from 'stores/index';

export function updateCurrentNetwork(currentNetwork: CurrentNetworkInfo): void {
  store.dispatch({ type: 'currentNetwork/update', payload: currentNetwork });
}

export function updateCurrentAccount(currentAcc: AccountJson): void {
  store.dispatch({ type: 'currentAccount/update', payload: currentAcc });
}
