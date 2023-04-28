import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getTokenLogo } from 'utils/index';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { CircleWavyCheck } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  itemName: string;
  logoKey: string;
  subLogoKey?: string;
  isSelected: boolean;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
  showSeparator?: boolean;
  iconSize?: number;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 12,
  alignItems: 'center',
  paddingHorizontal: 16,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 64,
  marginRight: 16,
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 20,
  color: ColorMap.light,
  ...sharedStyles.mediumText,
  ...FontSemiBold,
};

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: 'transparent',
};

const CheckIcon = CircleWavyCheck;

export const TokenSelectItem = ({
  itemName,
  logoKey,
  subLogoKey,
  isSelected,
  onSelectNetwork,
  defaultItemKey,
  showSeparator = true,
  iconSize = 28,
}: Props) => {
  return (
    <TouchableOpacity onPress={onSelectNetwork}>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          {getTokenLogo(logoKey, subLogoKey, iconSize, defaultItemKey)}
          <Text style={itemTextStyle}>{itemName}</Text>
        </View>

        {isSelected && <CheckIcon color={ColorMap.primary} weight={'bold'} size={20} />}
      </View>

      {showSeparator && <View style={itemSeparator} />}
    </TouchableOpacity>
  );
};
