import { CurrentNetworkInfo } from '@subwallet/extension-base/background/KoniTypes';
import { store } from 'stores/index';

export function updateCurrentNetwork(currentNetwork: CurrentNetworkInfo): void {
  store.dispatch({ type: 'currentNetwork/update', payload: currentNetwork });
}
