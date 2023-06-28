import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { CaretRight } from 'phosphor-react-native';
import { BrowserSearchProps } from 'routes/index';
import browserHomeStyle from './styles/BrowserHome';
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

interface HeaderProps {
  title: string;
  onPress: () => void;
}
interface SectionListProps {
  data: RecommendedListType[];
  renderItem: (item: DAppInfo) => JSX.Element;
}
type RecommendedListType = {
  data: DAppInfo[];
};
type SearchItemType = {
  isSearch?: boolean;
} & SiteInfo;
const styles = browserHomeStyle();
const ICON_ITEM_HEIGHT = 44;
const ITEM_HEIGHT = 72;
const SectionHeader: React.FC<HeaderProps> = ({ title, onPress }): JSX.Element => {
  return (
    <View style={styles.sectionContainer}>
      <Typography.Title style={styles.sectionTitle}>{title}</Typography.Title>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.sectionAction}>
          <Typography.Text style={styles.sectionActionTitle}>See all</Typography.Text>
          <Icon phosphorIcon={CaretRight} weight="bold" customSize={16} iconColor="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// TODO: ADD LW's item
const SectionList: React.FC<SectionListProps> = ({ data, renderItem }): JSX.Element => {
  return (
    <ScrollView horizontal>
      {data.map(item => (
        <View style={{ marginRight: 12 }}>{item.data.map(item2 => renderItem(item2))}</View>
      ))}
    </ScrollView>
  );
};

const BrowserSearch = ({ route }: BrowserSearchProps) => {
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

  const onPressSectionItem = (item: SearchItemType) => {
    console.log('a', item);
  };

  const renderRecentItem: ListRenderItem<StoredSiteInfo> = item => {
    const data = dApps.dapps.find(dAppItem => item.item.url.includes(dAppItem.id));
    return <IconItem data={data} />;
  };
  const renderBookmarkItem: ListRenderItem<StoredSiteInfo> = item => {
    const data = dApps.dapps.find(dAppItem => item.item.url.includes(dAppItem.id));
    return <IconItem data={data} isWithText />;
  };
  const renderSectionItem = (item: DAppInfo) => {
    console.log('item teim', item);
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
      <FastImage style={styles.banner} resizeMode="cover" source={Images.browserBanner} />
      <ScrollView>
        {historyItems && historyItems.length > 0 && (
          <>
            <SectionHeader title="Recent" onPress={() => console.log('press')} />
            <FlatList
              style={{ maxHeight: ICON_ITEM_HEIGHT + 11, marginBottom: 11 }}
              contentContainerStyle={{ alignItems: 'center' }}
              data={historyItems}
              renderItem={renderRecentItem}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              getItemLayout={(data, index) => ({ index, length: ICON_ITEM_HEIGHT, offset: ICON_ITEM_HEIGHT * index })}
              horizontal
            />
          </>
        )}
        <SectionHeader title="Favorite" onPress={() => console.log('press')} />
        <FlatList
          style={{ maxHeight: ITEM_HEIGHT + 11, marginBottom: 11 }}
          contentContainerStyle={{ alignItems: 'center' }}
          data={bookmarkItems}
          renderItem={renderBookmarkItem}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          getItemLayout={(data, index) => ({ index, length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index })}
          horizontal
        />
        <SectionHeader title="Recommended" onPress={() => console.log('press')} />
        <SectionList data={recommendedList} renderItem={renderSectionItem} />
      </ScrollView>
    </View>
  );
};
export default BrowserSearch;
