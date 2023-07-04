import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { RootNavigationProps, RootStackParamList } from 'routes/index';
import browserHomeStyle from './styles/BrowserListByCategory';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo, PredefinedDApps } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { SiteInfo } from 'stores/types';
import { getHostName } from 'utils/browser';
import { useNavigation } from '@react-navigation/native';
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
const BrowserListByCategory: React.FC<NativeStackScreenProps<RootStackParamList>> = ({ route }) => {
  const { searchString, navigationType } = route.params as BrowserListByCategoryProps;
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const [browserData] = useState<PredefinedDApps>(predefinedDApps);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const listByCategory = useMemo((): DAppInfo[] => {
    if (navigationType && navigationType === 'BOOKMARK') {
      const dAppsByBookmark = bookmarkItems.map(item =>
        browserData.dapps.find(dapp => {
          let isTrue = item.url.includes(dapp.id) && dapp.name.toLowerCase().includes(searchString);
          if (route.name === 'all') {
            return isTrue;
          }
          return isTrue && dapp.categories.includes(route.name);
        }),
      );
      return dAppsByBookmark.filter(item => !!item) as DAppInfo[];
    }
    if (route.name === 'all') {
      if (searchString) {
        return browserData.dapps.filter(item => item.name.toLowerCase().includes(searchString));
      }
      return browserData.dapps;
    }
    const data = browserData.dapps.filter(
      item => item.categories.includes(route.name) && item.name.toLowerCase().includes(searchString),
    );
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserData.dapps, searchString]);

  const itemSeparator = () => <View style={styles.itemSeparator} />;
  const onPressSectionItem = (item: SearchItemType) => {
    navigation.navigate('BrowserTabsManager', { url: item.url, name: item.name });
  };

  const getItemLayout = (data: DAppInfo[] | null | undefined, index: number) => ({
    index,
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
  });
  const keyExtractor = (item: DAppInfo) => item.id;
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
