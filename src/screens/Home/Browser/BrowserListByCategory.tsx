import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { CaretRight } from 'phosphor-react-native';
import { BrowserSearchProps } from 'routes/index';
import browserHomeStyle from './styles/BrowserListByCategory';
import FastImage from 'react-native-fast-image';
import { Images } from 'assets/index';
import { Typography, Icon } from 'components/design-system-ui';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo, PredefinedDApps } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { SiteInfo, StoredSiteInfo } from 'stores/types';
import IconItem from './Shared/IconItem';

type RecommendedListType = {
  data: DAppInfo[];
};
type SearchItemType = {
  isSearch?: boolean;
} & SiteInfo;
const styles = browserHomeStyle();
const ITEM_HEIGHT = 72;
const BrowserSearch = ({route}: BrowserSearchProps) => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const recommendedList = useMemo((): RecommendedListType[] => {
    const sectionData = [];
    for (let i = 0; i < dApps.dapps.length; i += 4) {
      const section = {
        data: dApps.dapps.slice(i, i + 4),
      };
      sectionData.push(section);
    }
    return sectionData;
  }, [dApps.dapps]);
  console.log('categoryID', route.name)

  const onPressSectionItem = (item: SearchItemType) => {
    console.log('a', item);
  };

  const renderBrowserItem = (item: DAppInfo) => {
    return (
      <BrowserItem
        style={{ width: 303, marginBottom: 16 }}
        name={item.name}
        url={item.url}
        onPress={() => onPressSectionItem(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarkItems}
        renderItem={renderBrowserItem}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        getItemLayout={(data, index) => ({ index, length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index })}
      />
    </View>
  );
};
export default BrowserSearch;
