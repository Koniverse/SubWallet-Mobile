import { ActiveCronAndSubscriptionMap, PriceJson, UiSettings } from '@subwallet/extension-base/background/KoniTypes';
import { store } from 'stores/index';
import { AuthUrlsSlice, BrowserSlice, BrowserSliceTab, SiteInfo } from 'stores/types';

export function updateSettings(settings: UiSettings): void {
  store.dispatch({ type: 'settings/update', payload: { ...settings } });
}

export function updatePrice(priceJson: PriceJson): void {
  const payload = { ...priceJson };
  delete payload.ready;
  store.dispatch({ type: 'price/update', payload });
}

export function updateAuthUrls(authUrlMap: AuthUrlsSlice['details']): void {
  store.dispatch({ type: 'authUrls/update', payload: { details: authUrlMap || {} } });
}

// Background service

export function updateBackgroundServiceActiveState(payload: ActiveCronAndSubscriptionMap): void {
  store.dispatch({ type: 'backgroundService/updateActiveState', payload });
}

// App State

export function toggleConfirmationDisplayState(): void {
  store.dispatch({ type: 'appState/toggleConfirmationDisplayState' });
}

// Browser

export function updateActiveTab(tabId: BrowserSlice['activeTab']): void {
  store.dispatch({ type: 'browser/updateActiveTab', payload: tabId });
}

export function createNewTab(url: string): void {
  store.dispatch({ type: 'browser/createNewTab', payload: url });
}

export function createNewTabIfEmpty(url: string): void {
  store.dispatch({ type: 'browser/createNewTabIfEmpty', payload: url });
}

export function closeTab(tabId: string): void {
  store.dispatch({ type: 'browser/closeTab', payload: tabId });
}

export function updateTab(payload: BrowserSliceTab): void {
  store.dispatch({ type: 'browser/updateTab', payload });
}

export function updateAccountsWaitingStatus(payload: boolean): void {
  store.dispatch({ type: 'accounts/updateWaitingStatus', payload });
}

export function updateTabScreenshot(id: string, screenshot: string): void {
  store.dispatch({ type: 'browser/updateTabScreenshot', payload: { id, screenshot } });
}

export function clearAllTabScreenshots(): void {
  store.dispatch({ type: 'browser/clearAllTabScreenshots' });
}

export function closeAllTab(): void {
  store.dispatch({ type: 'browser/closeAllTab' });
}

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
