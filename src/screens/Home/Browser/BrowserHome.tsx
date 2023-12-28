import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import createStylesheet from './styles/BrowserHome';
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
import ImageSlider from 'components/common/ImageSlider';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';

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
  const {
    browserDApps: { dApps },
  } = useGetDAppList();
  const navigation = useNavigation<RootNavigationProps>();
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const [loadingDataLv1, setLoadingDataLv1] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoadingDataLv1(false);
    }, 100);
  }, []);

  const onPressImageSliderItem = (index: number) => {
    !!bannerData && onPressSectionItem(bannerData[index]);
  };

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
      return [];
    }

    return bannerData.map(dApp => dApp.preview_image);
  }, [bannerData]);

  const onPressSectionItem = (item: DAppInfo) => {
    navigation.navigate('BrowserTabsManager', { url: item.url, name: item.title });
  };

  const renderRecentItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem data={dApps} itemData={item} />;
    },
    [dApps],
  );
  const renderBookmarkItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem data={dApps} itemData={item} isWithText />;
    },
    [dApps],
  );
  const renderSectionItem = (item: DAppInfo) => {
    return (
      <BrowserItem
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
        <ImageSlider data={getBannerImages} onPressItem={onPressImageSliderItem} />
        {!loadingDataLv1 && (
          <>
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
          </>
        )}
      </ScrollView>
    </View>
  );
};
export default BrowserHome;
