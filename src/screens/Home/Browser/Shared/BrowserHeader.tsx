import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { MagnifyingGlass } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from '../../../../constant';

interface Props {
  onPressSearchBar?: () => void;
  rightComponent?: JSX.Element;
}

const SearchIcon = MagnifyingGlass;

const getBrowserWrapperStyle = (hasRightComponent: boolean): StyleProp<any> => {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: hasRightComponent ? 0 : 10,
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

export const BrowserHeader = ({ onPressSearchBar, rightComponent }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();

  return (
    <View style={getBrowserWrapperStyle(!!rightComponent)}>
      <AccountSettingButton navigation={navigation} />
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={{ flex: 1, marginLeft: 8 }}
        onPress={onPressSearchBar}>
        <View style={searchBtnWrapperStyle}>
          <SearchIcon size={20} color={ColorMap.light} weight={'bold'} />
          <Text style={searchBtnTextStyle}>{i18n.common.searchPlaceholder}</Text>
        </View>
      </TouchableOpacity>

      {rightComponent}
    </View>
  );
};
