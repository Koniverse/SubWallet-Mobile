import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { MagnifyingGlass } from 'phosphor-react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from '../../../../constant';

const SearchIcon = MagnifyingGlass;

const getBrowserWrapperStyle = (isShowTabButton: boolean): StyleProp<any> => {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: isShowTabButton ? 6 : 10,
    width: '100%',
    height: 40,
  };
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

const getSelectTabButtonWrapperStyle = (isDisabled: boolean): StyleProp<any> => {
  return {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: isDisabled ? ColorMap.disabled : ColorMap.light,
    alignItems: 'center',
    justifyContent: 'center',
  };
};

const getSelectTabButtonTextStyle = (isDisabled: boolean) => {
  return {
    ...FontSize0,
    color: isDisabled ? ColorMap.disabled : ColorMap.light,
    ...FontMedium,
  };
};

const selectTabButtonStyle: StyleProp<any> = { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' };

interface Props {
  tabsNumber?: number;
  onPressSearchBar?: () => void;
  onPressTabButton?: () => void;
  isShowTabNumber?: boolean;
}

export const BrowserHeader = ({ tabsNumber, onPressSearchBar, onPressTabButton, isShowTabNumber = true }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  return (
    <View style={getBrowserWrapperStyle(!!tabsNumber)}>
      <AccountSettingButton navigation={navigation} />
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={{ flex: 1, marginLeft: 8, marginRight: 6 }}
        onPress={onPressSearchBar}>
        <View style={searchBtnWrapperStyle}>
          <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
          <Text style={searchBtnTextStyle}>{i18n.common.searchPlaceholder}</Text>
        </View>
      </TouchableOpacity>

      {isShowTabNumber && (
        <TouchableOpacity disabled={!tabsNumber} style={selectTabButtonStyle} onPress={onPressTabButton}>
          <View style={getSelectTabButtonWrapperStyle(!onPressTabButton)}>
            <Text style={getSelectTabButtonTextStyle(!onPressTabButton)}>{tabsNumber}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
