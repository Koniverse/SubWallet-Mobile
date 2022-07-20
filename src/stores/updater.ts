import {
  BalanceJson,
  ChainRegistry,
  CurrentNetworkInfo,
  NetworkJson,
  PriceJson,
  ResponseSettingsType,
  TransactionHistoryItemType,
} from '@subwallet/extension-base/background/KoniTypes';
import { store } from 'stores/index';
import { AccountsStoreType } from 'stores/types';

export function updateNetworkMap(payload: Record<string, NetworkJson>): void {
  store.dispatch({ type: 'networkMap/updateNetworkMap', payload });
}

export function updateChainRegistry(payload: Record<string, ChainRegistry>): void {
  store.dispatch({ type: 'chainRegistry/update', payload });
}

export function updateBalance(payload: BalanceJson): void {
  store.dispatch({ type: 'balance/update', payload });
}

export function updateSettings(payload: ResponseSettingsType): void {
  store.dispatch({ type: 'settings/updateSettings', payload });
}

export function updatePrice(payload: PriceJson): void {
  store.dispatch({ type: 'price/updatePrice', payload });
}

export function updateTransactionHistory(payload: Record<string, TransactionHistoryItemType[]>): void {
  store.dispatch({ type: 'transactionHistory/update', payload });
}

export function updateAccountsAndCurrentAccount(payload: AccountsStoreType): void {
  store.dispatch({ type: 'accounts/updateAccountsAndCurrentAccount', payload });
}

export function updateCurrentNetwork(payload: CurrentNetworkInfo): void {
  store.dispatch({ type: 'currentNetwork/update', payload });
}
