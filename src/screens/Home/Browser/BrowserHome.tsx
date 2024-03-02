import React, { useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import createStylesheet from './styles/BrowserHome';
import { DAppInfo } from 'types/browser';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import ImageSlider from 'components/common/ImageSlider';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';
import BookmarkSection from './Shared/BookmarkSection';
import RecommendSection from './Shared/RecommendSection';
import HistorySection from './Shared/HistorySection';
import MissionPoolSection from './Shared/MissionPoolSection';

const ItemSeparator = () => {
  const stylesheet = createStylesheet();
  return <View style={stylesheet.flatListSeparator} />;
};
const BrowserHome = () => {
  const stylesheet = createStylesheet();
  const {
    browserDApps: { dApps },
  } = useGetDAppList();
  const navigation = useNavigation<RootNavigationProps>();

  const onPressImageSliderItem = (index: number) => {
    !!bannerData && onPressSectionItem(bannerData[index]);
  };

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

  const onPressSectionItem = useCallback(
    (item: DAppInfo) => {
      navigation.navigate('BrowserTabsManager', { url: item.url, name: item.title });
    },
    [navigation],
  );

  return (
    <View style={stylesheet.container}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <ImageSlider data={getBannerImages} onPressItem={onPressImageSliderItem} />

        <HistorySection dApps={dApps} renderItemSeparator={ItemSeparator} />
        <BookmarkSection dApps={dApps} renderItemSeparator={ItemSeparator} />
        <RecommendSection dApps={dApps} onPressSectionItem={onPressSectionItem} />
        <MissionPoolSection />
      </ScrollView>
    </View>
  );
};
export default BrowserHome;
