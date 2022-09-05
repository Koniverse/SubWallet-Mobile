import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { MagnifyingGlass } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from '../../../constant';
import i18n from 'utils/i18n/i18n';

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
  height: 48,
};

const searchBtnTextStyle: StyleProp<any> = {
  marginHorizontal: 8,
  ...sharedStyles.mainText,
  lineHeight: 20,
  ...FontMedium,
  color: ColorMap.disabled,
};

export const BrowserScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const SearchIcon = MagnifyingGlass;

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
              <View>
                <Text style={searchBtnTextStyle}>{i18n.common.searchPlaceholder}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <EmptyListPlaceholder />
      </>
    </ScreenContainer>
  );
};
