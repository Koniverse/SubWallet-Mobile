import React, { useMemo } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { RootStackParamList } from 'routes/index';
import browserHomeStyle from './styles/BrowserListByCategory';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { getHostName } from 'utils/browser';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CategoryEmptyList } from 'screens/Home/Browser/Shared/CategoryEmptyList';
import { browserListItemHeight, browserListSeparator } from 'constants/itemHeight';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';

export interface BrowserListByCategoryProps {
  searchString: string;
  navigationType: 'BOOKMARK' | 'RECOMMENDED';
}

const styles = browserHomeStyle();
const ITEM_HEIGHT = browserListItemHeight;
const ITEM_SEPARATOR = browserListSeparator;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_SEPARATOR;

const BrowserListByCategory: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route, navigation }) => {
  const { searchString, navigationType } = route.params as BrowserListByCategoryProps;
  const theme = useSubWalletTheme().swThemes;
  const {
    browserDApps: { dApps },
  } = useGetDAppList();
  const bookmarkedItems = useSelector((state: RootState) => state.browser.bookmarks);

  const listByCategory = useMemo((): DAppInfo[] => {
    if (!dApps || dApps.length === 0) {
      return [];
    }
    // Get Data by Bookmark
    if (navigationType && navigationType === 'BOOKMARK') {
      const bookmarkedData = bookmarkedItems.map(bookmarkedItem => {
        // if bookmark item is a pre-defined dapp
        const bookmarkedDApp = dApps.find(
          dapp => bookmarkedItem.url.includes(dapp.url) && dapp.title.toLowerCase().includes(searchString),
        );

        if (bookmarkedDApp) {
          // if that dapp inside "all" tab or inside its categories
          if (route.name === 'all' || bookmarkedDApp?.categories.includes(route.name)) {
            return { ...bookmarkedDApp, url: bookmarkedItem.url, title: bookmarkedItem.name };
          }

          return undefined;
        }

        // if bookmarked item is not a pre-defined dapp or a webpage
        if (route.name === 'all') {
          return {
            title: bookmarkedItem.name,
            id: bookmarkedItem.id,
            url: bookmarkedItem.url,
            icon: '',
            categories: [],
          };
        }

        return undefined;
      });
      return bookmarkedData.filter(item => item !== undefined) as DAppInfo[];
    }

    // Get Data by Category
    if (route.name === 'all') {
      if (searchString) {
        return dApps.filter(item => item.title.toLowerCase().includes(searchString));
      }
      return dApps;
    }
    const data = dApps.filter(
      item => item.categories.includes(route.name) && item.title.toLowerCase().includes(searchString),
    );
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dApps, searchString, bookmarkedItems]);

  const getItemLayout = (data: DAppInfo[] | null | undefined, index: number) => ({
    index,
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
  });
  const keyExtractor = (item: DAppInfo) => item.id + item.url;
  const onPressSectionItem = (item: DAppInfo) => {
    navigation.navigate('BrowserTabsManager', { url: item.url, name: item.title });
  };
  const renderBrowserItem: ListRenderItem<DAppInfo> = ({ item }) => {
    const dapp = dApps?.find(app => item.url.includes(app.url));

    return (
      <BrowserItem
        key={item.id}
        logo={dapp?.icon}
        tags={dapp?.categories}
        style={styles.listItem}
        title={dapp?.title || item.title}
        subtitle={navigationType === 'BOOKMARK' ? item.url : getHostName(item.url)}
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
          getItemLayout={getItemLayout}
        />
      ) : (
        <CategoryEmptyList />
      )}
    </View>
  );
};

export default BrowserListByCategory;
