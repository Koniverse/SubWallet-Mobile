import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import createStylesheet from './styles/BrowserHome';
import FastImage from 'react-native-fast-image';
import { Images } from 'assets/index';
import { Icon, Typography } from 'components/design-system-ui';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { StoredSiteInfo } from 'stores/types';
import IconItem from './Shared/IconItem';
import { getHostName } from 'utils/browser';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { browserHomeItem, browserHomeItemIconOnly, browserHomeItemWidth } from 'constants/itemHeight';
import { useGetDAPPsQuery } from 'stores/API';
import { SliderBox } from 'react-native-image-slider-box';

interface HeaderProps {
  title: string;
  actionTitle: string;
  onPress: () => void;
}
interface SectionListProps {
  data: RecommendedListType[];
  renderItem: (item: DAppInfo) => JSX.Element;
}
type RecommendedListType = {
  data: DAppInfo[];
};
const ICON_ITEM_HEIGHT = browserHomeItemIconOnly;
const ITEM_HEIGHT = browserHomeItem;
const ITEM_WIDTH = browserHomeItemWidth;
const paginationBoxStyle = {
  position: 'absolute',
  bottom: -12,
  right: 0,
  left: 0,
  padding: 0,
  alignItems: 'center',
  alignSelf: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
};
const dotStyle = {
  width: 6,
  height: 6,
  borderRadius: 3,
  marginHorizontal: 0,
  padding: 0,
  margin: 0,
  backgroundColor: 'rgba(128, 128, 128, 0.92)',
};
const SectionHeader: React.FC<HeaderProps> = ({ title, actionTitle, onPress }): JSX.Element => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet();
  return (
    <View style={stylesheet.sectionContainer}>
      <Typography.Title level={5} style={stylesheet.sectionTitle}>
        {title}
      </Typography.Title>
      <TouchableOpacity onPress={onPress}>
        <View style={stylesheet.sectionAction}>
          <Typography.Text style={stylesheet.sectionActionTitle}>{actionTitle}</Typography.Text>
          <Icon phosphorIcon={CaretRight} weight="bold" customSize={16} iconColor={theme.colorTextLight1} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SectionList: React.FC<SectionListProps> = ({ data, renderItem }): JSX.Element => {
  const stylesheet = createStylesheet();
  return (
    <ScrollView
      horizontal
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stylesheet.recommendListContentContainer}>
      {data.map(item => (
        <View key={Math.random()} style={stylesheet.recommendListSeparator}>
          {item.data.map(item2 => renderItem(item2))}
        </View>
      ))}
    </ScrollView>
  );
};
const ItemSeparator = () => {
  const stylesheet = createStylesheet();
  return <View style={stylesheet.flatListSeparator} />;
};
const BrowserHome = () => {
  const stylesheet = createStylesheet();
  const theme = useSubWalletTheme().swThemes;
  const { data: dApps, isLoading, refetch } = useGetDAPPsQuery(undefined);
  const navigation = useNavigation<RootNavigationProps>();
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommendedList = useMemo((): RecommendedListType[] | [] => {
    if (!dApps) {
      return [];
    }
    const sectionData = [];
    for (let i = 0; i < 20; i += 5) {
      const section = {
        data: dApps.slice(i, i + 5),
      };
      sectionData.push(section);
    }
    return sectionData;
  }, [dApps]);

  const bannerData = useMemo(() => {
    if (!dApps) {
      return undefined;
    }

    return dApps.filter(dApp => dApp.is_featured);
  }, [dApps]);
  const getBannerImages = useMemo(() => {
    if (!bannerData) {
      return [Images.browserBanner];
    }

    return bannerData.map(dApp => dApp.preview_image);
  }, [bannerData]);

  const onPressSectionItem = (item: DAppInfo) => {
    navigation.navigate('BrowserTabsManager', { url: item.url, name: item.title });
  };

  const renderRecentItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem isLoading={isLoading} data={dApps} itemData={item} />;
    },
    [dApps, isLoading],
  );
  const renderBookmarkItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem isLoading={isLoading} data={dApps} itemData={item} isWithText />;
    },
    [dApps, isLoading],
  );
  const renderSectionItem = (item: DAppInfo) => {
    return (
      <BrowserItem
        isLoading={isLoading}
        key={item.id}
        style={stylesheet.browserItem}
        title={item.title}
        subtitle={getHostName(item.url)}
        url={item.url}
        logo={item.icon}
        tags={item.categories}
        onPress={() => onPressSectionItem(item)}
      />
    );
  };
  const getItemLayout = (data: StoredSiteInfo[] | null | undefined, index: number) => ({
    index,
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
  });

  return (
    <View style={stylesheet.container}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <SliderBox
          ImageComponent={FastImage}
          images={getBannerImages}
          sliderBoxHeight={200}
          onCurrentImagePressed={(index: number) => bannerData && onPressSectionItem(bannerData[index])}
          dotColor="white"
          inactiveDotColor="#90A4AE"
          autoplay
          resizeMethod={'resize'}
          resizeMode={'cover'}
          paginationBoxStyle={paginationBoxStyle}
          dotStyle={dotStyle}
          ImageComponentStyle={stylesheet.banner}
          imageLoadingColor="#2196F3"
        />
        {historyItems && historyItems.length > 0 && (
          <>
            <SectionHeader
              title={i18n.browser.recent}
              actionTitle={i18n.browser.seeAll}
              onPress={() => navigation.navigate('BrowserSearch')}
            />
            <FlatList
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: ICON_ITEM_HEIGHT, marginBottom: theme.marginSM }}
              contentContainerStyle={stylesheet.flatListContentContainer}
              data={historyItems}
              renderItem={renderRecentItem}
              ItemSeparatorComponent={ItemSeparator}
              getItemLayout={getItemLayout}
              horizontal
            />
          </>
        )}
        {bookmarkItems && bookmarkItems.length > 0 && (
          <>
            <SectionHeader
              title={i18n.browser.favorite}
              actionTitle={i18n.browser.seeAll}
              onPress={() => navigation.navigate('BrowserListByTabview', { type: 'BOOKMARK' })}
            />
            <FlatList
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: ITEM_HEIGHT, marginBottom: theme.marginSM }}
              contentContainerStyle={stylesheet.flatListContentContainer}
              data={bookmarkItems}
              renderItem={renderBookmarkItem}
              ItemSeparatorComponent={ItemSeparator}
              getItemLayout={getItemLayout}
              horizontal
            />
          </>
        )}
        <SectionHeader
          title={i18n.browser.recommended}
          actionTitle={i18n.browser.seeAll}
          onPress={() => navigation.navigate('BrowserListByTabview', { type: 'RECOMMENDED' })}
        />
        <SectionList data={recommendedList} renderItem={renderSectionItem} />
      </ScrollView>
    </View>
  );
};
export default BrowserHome;
