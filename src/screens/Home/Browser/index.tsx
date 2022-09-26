import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { GlobeHemisphereEast, GlobeSimple } from 'phosphor-react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BrowserItem } from 'components/BrowserItem';
import { StoredSiteInfo } from 'stores/types';
import { Button } from 'components/Button';
import { openPressSiteItem } from 'screens/Home/Browser/shared';
import { BrowserHeader } from 'screens/Home/Browser/Shared/BrowserHeader';

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
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 6,
};

const rightHeaderButtonTextOutlineStyle: StyleProp<any> = {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 2,
  borderColor: ColorMap.light,
  alignItems: 'center',
  justifyContent: 'center',
};

const rightHeaderButtonTextStyle: StyleProp<any> = {
  ...FontSize0,
  color: ColorMap.light,
  ...FontMedium,
  lineHeight: 16,
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
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const tabsNumber = useSelector((state: RootState) => state.browser.tabs.length);
  const navigation = useNavigation<RootNavigationProps>();
  const isEmptyTabs = !tabsNumber;

  const renderSiteItem = (item: StoredSiteInfo) => {
    return (
      <BrowserItem
        key={item.id}
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => {
          openPressSiteItem(navigation, item, isEmptyTabs);
        }}
      />
    );
  };

  const onPressSearchBar = useCallback(() => {
    navigation.navigate('BrowserSearch', { isOpenNewTab: isEmptyTabs });
  }, [navigation, isEmptyTabs]);

  const onOpenBrowserTabs = useCallback(() => {
    navigation.navigate('BrowserTabsManager', { isOpenTabs: true });
  }, [navigation]);

  const browserHeaderRightComponent = useMemo(() => {
    return (
      <TouchableOpacity style={rightHeaderButtonStyle} onPress={onOpenBrowserTabs}>
        <View style={rightHeaderButtonTextOutlineStyle}>
          <Text style={rightHeaderButtonTextStyle}>{tabsNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onOpenBrowserTabs, tabsNumber]);

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <BrowserHeader onPressSearchBar={onPressSearchBar} rightComponent={browserHeaderRightComponent} />

        {!!bookmarkItems.length || !!historyItems.length ? (
          <ScrollView style={{ flex: 1, marginTop: 16 }} contentContainerStyle={{ paddingBottom: 12 }}>
            {!!bookmarkItems.length && (
              <>
                {renderGroupHeader(i18n.common.favorites, () => navigation.navigate('FavouritesGroupDetail'))}

                {bookmarkItems.slice(0, 15).map(item => renderSiteItem(item))}
              </>
            )}

            {!!historyItems.length && (
              <>
                {renderGroupHeader(i18n.common.history, () => navigation.navigate('HistoryGroupDetail'))}

                {historyItems.slice(0, 15).map(item => renderSiteItem(item))}
              </>
            )}
          </ScrollView>
        ) : (
          <EmptyListPlaceholder icon={GlobeSimple} title={i18n.common.emptyBrowserMessage} />
        )}
      </>
    </ScreenContainer>
  );
};
