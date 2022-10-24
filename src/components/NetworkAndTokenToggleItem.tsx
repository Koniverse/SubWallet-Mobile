import React from 'react';
import { StyleProp, Switch, View } from 'react-native';
import Text from 'components/Text';
import { getNetworkLogo } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
interface Props {
  itemName: string;
  itemKey: string;
  isEnabled: boolean;
  onValueChange: () => void;
  isDisableSwitching?: boolean;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 16,
  alignItems: 'center',
  paddingHorizontal: 16,
  flex: 1,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  paddingRight: 16,
};

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 64,
  marginRight: 16,
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 16,
  color: ColorMap.light,
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  flex: 1,
};

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.light,
  borderRadius: 40,
};

export const NetworkAndTokenToggleItem = ({
  itemKey,
  itemName,
  isEnabled,
  onValueChange,
  isDisableSwitching,
}: Props) => {
  return (
    <View>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <View style={logoWrapperStyle}>{getNetworkLogo(itemKey, 40)}</View>

          <Text numberOfLines={1} style={itemTextStyle}>
            {itemName}
          </Text>
        </View>

        <Switch
          disabled={isDisableSwitching}
          ios_backgroundColor={ColorMap.switchInactiveButtonColor}
          value={isEnabled}
          onValueChange={onValueChange}
        />
      </View>

      <View style={itemSeparator} />
    </View>
  );
};
