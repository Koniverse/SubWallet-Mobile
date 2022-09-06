import React from 'react';
import { ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { GlobeHemisphereEast, MagnifyingGlass } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from '../../../constant';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BrowserItem } from 'components/BrowserItem';
import { SiteInfo } from 'stores/types';

const browserScreenHeader: StyleProp<any> = {
  flexDirection: 'row',
  paddingHorizontal: 16,
  alignItems: 'center',
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
  paddingVertical: 24,
};

export const BrowserScreen = () => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const navigation = useNavigation<RootNavigationProps>();
  const SearchIcon = MagnifyingGlass;

  const onPressItem = (item: SiteInfo) => {
    navigation.navigate('BrowserTab', { url: item.url, name: item.name });
  };

  const renderSiteItem = (item: SiteInfo) => {
    return (
      <BrowserItem
        key={item.url}
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => onPressItem(item)}
      />
    );
  };

  return (
    <ScreenContainer placeholderBgc={ColorMap.dark1}>
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
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {!!bookmarkItems.length && (
              <>
                <Text style={searchTitleStyle}>{i18n.common.favorites}</Text>

                {bookmarkItems.slice(0, 15).map(item => renderSiteItem(item))}
              </>
            )}

            {!!historyItems.length && (
              <>
                <Text style={searchTitleStyle}>{i18n.common.history}</Text>

                {historyItems.slice(0, 15).map(item => renderSiteItem(item))}
              </>
            )}
          </ScrollView>
        ) : (
          <EmptyListPlaceholder />
        )}
      </>
    </ScreenContainer>
  );
};
