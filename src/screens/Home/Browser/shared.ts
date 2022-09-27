import { RootNavigationProps } from 'routes/index';
import { StoredSiteInfo } from 'stores/types';
import { createNewTab } from 'stores/updater';

export function openPressSiteItem(navigation: RootNavigationProps, item: StoredSiteInfo, isCreateNewTab?: boolean) {
  if (isCreateNewTab) {
    createNewTab(item.url);
  }

  navigation.navigate('BrowserTabsManager', { url: item.url, name: item.name });
}
