import Text from 'components/Text';
import { View } from 'react-native';
import React from 'react';
import { ColorMap } from 'styles/color';
import { IconProps, IconWeight } from 'phosphor-react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';

interface Props {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
  iconWeight?: IconWeight;
}

export const EmptyList = ({ icon: Icon, title, iconWeight }: Props) => {
  return (
    <View style={centerStyle}>
      <Icon size={80} color={ColorMap.disabled} weight={iconWeight || 'thin'} />
      <Text style={emptyListTextStyle}>{title}</Text>
    </View>
  );
};
