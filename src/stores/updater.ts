import {
  BalanceJson,
  ChainRegistry,
  CrowdloanJson,
  NetworkJson,
  PriceJson,
  ResponseSettingsType,
  TransactionHistoryItemType,
} from '@subwallet/extension-base/background/KoniTypes';
import { store } from 'stores/index';
import { AccountsSlice, NftCollectionSlice, NftSlice, AuthUrlsSlice, SiteInfo } from 'stores/types';

export function updateNetworkMap(networkMap: Record<string, NetworkJson>): void {
  store.dispatch({ type: 'networkMap/update', payload: { details: networkMap } });
}

export function updateChainRegistry(chainRegistryMap: Record<string, ChainRegistry>): void {
  store.dispatch({ type: 'chainRegistry/update', payload: { details: chainRegistryMap } });
}

export function updateBalance(balanceJson: BalanceJson): void {
  store.dispatch({ type: 'balance/update', payload: { ...balanceJson } });
}

export function updateSettings(settings: ResponseSettingsType): void {
  store.dispatch({ type: 'settings/update', payload: { ...settings } });
}

export function updatePrice(priceJson: PriceJson): void {
  const payload = { ...priceJson };
  delete payload.ready;
  store.dispatch({ type: 'price/update', payload });
}

export function updateTransactionHistory(transactionHistoryMap: Record<string, TransactionHistoryItemType[]>): void {
  store.dispatch({ type: 'transactionHistory/update', payload: { details: transactionHistoryMap } });
}

export function updateAccountsSlice(payload: AccountsSlice): void {
  store.dispatch({ type: 'accounts/update', payload });
}

export function updateAccountsAndCurrentAccount(payload: AccountsSlice): void {
  store.dispatch({ type: 'accounts/updateAccountsAndCurrentAccount', payload });
}

export function updateAccountsWaitingStatus(payload: boolean): void {
  store.dispatch({ type: 'accounts/updateWaitingStatus', payload });
}

export function updateCrowdloan(payload: CrowdloanJson): void {
  store.dispatch({ type: 'crowdloan/update', payload });
}

export function updateNftCollection(payload: NftCollectionSlice): void {
  store.dispatch({ type: 'nftCollection/update', payload });
}

export function updateNft(payload: NftSlice): void {
  store.dispatch({ type: 'nft/update', payload });
}

export function updateAuthUrls(authUrlMap: AuthUrlsSlice['details']): void {
  store.dispatch({ type: 'authUrls/update', payload: { details: authUrlMap || {} } });
}

// App State

export function toggleConfirmationDisplayState(): void {
  store.dispatch({ type: 'appState/toggleConfirmationDisplayState' });
}

// browser

export function addToHistory(payload: SiteInfo): void {
  store.dispatch({ type: 'browser/addToHistory', payload });
}

export function updateLatestItemInHistory(payload: SiteInfo): void {
  store.dispatch({ type: 'browser/updateLatestItemInHistory', payload });
}

export function clearHistory(): void {
  store.dispatch({ type: 'browser/clearHistory' });
}

export function addBookmark(payload: SiteInfo): void {
  store.dispatch({ type: 'browser/addBookmark', payload });
}

export function removeBookmark(payload: SiteInfo): void {
  store.dispatch({ type: 'browser/removeBookmark', payload });
}
