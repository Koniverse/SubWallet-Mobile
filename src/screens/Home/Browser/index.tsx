import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { GlobeHemisphereEast, GlobeSimple } from 'phosphor-react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BrowserItem } from 'components/BrowserItem';
import { StoredSiteInfo } from 'stores/types';
import { Button } from 'components/Button';
import { EmptyList } from 'components/EmptyList';
import { Header } from 'components/Header';
import { SVGImages } from 'assets/index';
import styles from './styles/BrowserHome';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import { TabView, TabBar, SceneMap, NavigationState, SceneRendererProps } from 'react-native-tab-view';

const searchTitleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const groupHeaderWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: 16,
};

const rightHeaderButtonStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  alignItems: 'flex-end',
  justifyContent: 'center',
};

const rightHeaderButtonTextOutlineStyle: StyleProp<any> = {
  width: 18,
  height: 18,
  borderRadius: 1,
  borderWidth: 2,
  borderColor: ColorMap.light,
  alignItems: 'center',
  justifyContent: 'center',
};

const rightHeaderButtonTextStyle: StyleProp<any> = {
  ...FontSize0,
  fontSize: 10,
  color: ColorMap.light,
  fontWeight: '700',
  ...FontMedium,
  lineHeight: 13,
};

function renderGroupHeader(title: string, onPressSeeAllBtn: () => void) {
  return (
    <View style={groupHeaderWrapperStyle}>
      <Text style={searchTitleStyle}>{title}</Text>

      <Button title={i18n.common.seeAll} onPress={onPressSeeAllBtn} />
    </View>
  );
}

export const BrowserScreen = () => {
  const [dApps, setDApps] = useState<PredefinedDApps>(predefinedDApps);
  const [tabviewIndex, ontabviewIndexChange] = useState<number>(1);
  // const historyItems = useSelector((state: RootState) => state.browser.history);
  // const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const tabsNumber = useSelector((state: RootState) => state.browser.tabs.length);
  const navigation = useNavigation<RootNavigationProps>();
  const tabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));

  const renderScene = ({ route, jumpTo, position }) => {
    if (position === 0) {
      return <BrowserHome tabRoute={route} jumpTo={jumpTo} position={position} />;
    }

    return <BrowserHome tabRoute={route} jumpTo={jumpTo} position={position} />;
  };
  const renderTabBar = (props: SceneRendererProps & { navigationState: State }) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: 'blue', width: 0.77, left: 0 }}
      style={{ backgroundColor: 'transparent' }}
      tabStyle={{ width: 'auto', paddingBottom: 0, justifyContent: 'flex-end' }}
      labelStyle={{ textTransform: 'capitalize', paddingBottom: 0, marginLeft: 4 }}
    />
  );
  // const renderSiteItem = (item: StoredSiteInfo) => {
  //   return (
  //     <BrowserItem
  //       key={item.id}
  //       leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
  //       text={item.url}
  //       onPress={() => navigation.navigate('BrowserTabsManager', { url: item.url, name: item.name })}
  //     />
  //   );
  // };

  // const onPressSearchBar = useCallback(() => {
  //   navigation.navigate('BrowserSearch');
  // }, [navigation]);

  const onOpenBrowserTabs = useCallback(() => {
    navigation.navigate('BrowserTabsManager', { isOpenTabs: true });
  }, [navigation]);

  const browserHeaderRightComponent = useMemo(() => {
    return (
      <TouchableOpacity style={rightHeaderButtonStyle} onPress={onOpenBrowserTabs}>
        <View style={rightHeaderButtonTextOutlineStyle}>
          <View style={{ position: 'absolute', top: -6.5, right: -6.5 }}>
            <Suspense>
              <SVGImages.IcHalfSquare width={19} height={19} />
            </Suspense>
          </View>
          <Text style={rightHeaderButtonTextStyle}>{tabsNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onOpenBrowserTabs, tabsNumber]);

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <Header rightComponent={browserHeaderRightComponent} />

        {tabRoutes.length > 0 && (
          <TabView
            lazy
            navigationState={{
              index: tabviewIndex,
              routes: tabRoutes,
            }}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={ontabviewIndexChange}
          />
        )}
      </>
    </ScreenContainer>
  );
};

// {!!bookmarkItems.length || !!historyItems.length ? (
//   <ScrollView style={{ flex: 1, marginTop: 16 }} contentContainerStyle={{ paddingBottom: 12 }}>
//     {!!bookmarkItems.length && (
//       <>
//         {renderGroupHeader(i18n.common.favorites, () => navigation.navigate('FavouritesGroupDetail'))}

//         {bookmarkItems.slice(0, 15).map(item => renderSiteItem(item))}
//       </>
//     )}

//     {!!historyItems.length && (
//       <>
//         {renderGroupHeader(i18n.common.history, () => navigation.navigate('HistoryGroupDetail'))}

//         {historyItems.slice(0, 15).map(item => renderSiteItem(item))}
//       </>
//     )}
//   </ScrollView>
// ) : (
//   <EmptyList
//     icon={GlobeSimple}
//     title={i18n.emptyScreen.browserEmptyTitle}
//     message={i18n.emptyScreen.browserEmptyMessage}
//   />
// )}
