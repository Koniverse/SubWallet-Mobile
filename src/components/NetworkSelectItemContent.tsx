import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { getNetworkLogo } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { CircleWavyCheck } from 'phosphor-react-native';
interface Props {
  itemName: string;
  itemKey: string;
  isSelected: boolean;
  defaultItemKey?: string;
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
  backgroundColor: ColorMap.light,
  borderRadius: 28,
};

export const NetworkSelectItemContent = ({ itemKey, itemName, isSelected, defaultItemKey }: Props) => {
  const CheckIcon = CircleWavyCheck;
  return (
    <View>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <View style={logoWrapperStyle}>{getNetworkLogo(itemKey, 28, defaultItemKey)}</View>
          <Text style={itemTextStyle}>{itemName}</Text>
        </View>

        {isSelected && <CheckIcon color={ColorMap.primary} weight={'bold'} size={20} />}
      </View>

      <View style={itemSeparator} />
    </View>
  );
};
