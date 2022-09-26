import React from 'react';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { GlobeHemisphereEast, GlobeSimple, MagnifyingGlass } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BrowserItem } from 'components/BrowserItem';
import { StoredSiteInfo } from 'stores/types';
import { Button } from 'components/Button';

const browserScreenHeader: StyleProp<any> = {
  flexDirection: 'row',
  paddingHorizontal: 16,
  alignItems: 'center',
  height: 40,
};

const searchBtnWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  alignItems: 'center',
  paddingRight: 16,
  paddingLeft: 16,
  flexDirection: 'row',
  height: 44,
};

const searchBtnTextStyle: StyleProp<any> = {
  marginHorizontal: 16,
  ...sharedStyles.mainText,
  lineHeight: 20,
  ...FontMedium,
  color: ColorMap.disabled,
};

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

function renderGroupHeader(title: string, onPressSeeAllBtn: () => void) {
  return (
    <View style={groupHeaderWrapperStyle}>
      <Text style={searchTitleStyle}>{title}</Text>

      <Button title={i18n.common.seeAll} onPress={onPressSeeAllBtn} />
    </View>
  );
}

const SearchIcon = MagnifyingGlass;

export const BrowserScreen = () => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const navigation = useNavigation<RootNavigationProps>();

  const onPressItem = (item: StoredSiteInfo) => {
    navigation.navigate('BrowserTab', { url: item.url, name: item.name });
  };

  const renderSiteItem = (item: StoredSiteInfo) => {
    return (
      <BrowserItem
        key={item.id}
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => onPressItem(item)}
      />
    );
  };

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <View style={browserScreenHeader}>
          <AccountSettingButton navigation={navigation} />

          <TouchableOpacity
            activeOpacity={BUTTON_ACTIVE_OPACITY}
            style={{ flex: 1, marginLeft: 8 }}
            onPress={() => navigation.navigate('BrowserSearch')}>
            <View style={searchBtnWrapperStyle}>
              <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
              <Text style={searchBtnTextStyle}>{i18n.common.searchPlaceholder}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!!bookmarkItems.length || !!historyItems.length ? (
          <ScrollView style={{ flex: 1, marginVertical: 16 }}>
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
