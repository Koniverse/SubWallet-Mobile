import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { RootStackParamList } from 'routes/index';
import browserHomeStyle from './styles/BrowserListByCategory';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo, PredefinedDApps } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { SiteInfo } from 'stores/types';
import { getHostName } from 'utils/browser';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CategoryEmptyList } from 'screens/Home/Browser/Shared/CategoryEmptyList';

export interface BrowserListByCategoryProps {
  searchString: string;
  navigationType: 'BOOKMARK' | 'RECOMMENDED';
}
type SearchItemType = {
  isSearch?: boolean;
} & SiteInfo;
const styles = browserHomeStyle();
const ITEM_HEIGHT = 72;
const BrowserListByCategory: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route, navigation }) => {
  const { searchString, navigationType } = route.params as BrowserListByCategoryProps;
  const theme = useSubWalletTheme().swThemes;
  const [predefinedData] = useState<PredefinedDApps>(predefinedDApps);
  const bookmarkedItems = useSelector((state: RootState) => state.browser.bookmarks);

  const listByCategory = useMemo((): DAppInfo[] => {
    // Get Data by Bookmark
    if (navigationType && navigationType === 'BOOKMARK') {
      const bookmarkedData = bookmarkedItems.map(bookmarkedItem => {
        // if bookmark item is a pre-defined dapp
        const bookmarkedDApp = predefinedData.dapps.find(
          dapp => bookmarkedItem.url.includes(dapp.id) && dapp.name.toLowerCase().includes(searchString),
        );

        if (bookmarkedDApp) {
          // if that dapp inside "all" tab or inside its categories
          if (route.name === 'all' || bookmarkedDApp?.categories.includes(route.name)) {
            return bookmarkedDApp;
          }

          return undefined;
        }

        // if bookmarked item is not a pre-defined dapp or a webpage
        return {
          name: bookmarkedItem.name,
          id: bookmarkedItem.id,
          url: bookmarkedItem.url,
          icon: '',
          categories: [],
        };
      });
      return bookmarkedData.filter(item => item !== undefined) as DAppInfo[];
    }

    // Get Data by Category
    if (route.name === 'all') {
      if (searchString) {
        return predefinedData.dapps.filter(item => item.name.toLowerCase().includes(searchString));
      }
      return predefinedData.dapps;
    }
    const data = predefinedData.dapps.filter(
      item => item.categories.includes(route.name) && item.name.toLowerCase().includes(searchString),
    );
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predefinedData.dapps, searchString, bookmarkedItems]);

  const itemSeparator = () => <View style={styles.itemSeparator} />;
  const getItemLayout = (data: DAppInfo[] | null | undefined, index: number) => ({
    index,
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
  });
  const keyExtractor = (item: DAppInfo) => item.id;
  const onPressSectionItem = (item: SearchItemType) => {
    navigation.navigate('BrowserTabsManager', { url: item.url, name: item.name });
  };
  const renderBrowserItem: ListRenderItem<DAppInfo> = ({ item }) => {
    const dapp = predefinedDApps.dapps.find(a => item.url.includes(a.id));

    return (
      <BrowserItem
        key={item.id}
        logo={dapp?.icon}
        tags={dapp?.categories}
        style={styles.listItem}
        title={dapp?.name || item.name}
        subtitle={getHostName(item.url)}
        url={item.url}
        onPress={() => onPressSectionItem(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      {listByCategory.length ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          maxToRenderPerBatch={12}
          initialNumToRender={12}
          removeClippedSubviews
          data={listByCategory}
          keyExtractor={keyExtractor}
          style={{ padding: theme.padding, paddingTop: theme.paddingSM }}
          renderItem={renderBrowserItem}
          ItemSeparatorComponent={itemSeparator}
          getItemLayout={getItemLayout}
        />
      ) : (
        <CategoryEmptyList />
      )}
    </View>
  );
};

export default BrowserListByCategory;
