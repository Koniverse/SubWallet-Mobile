import React from 'react';
import { Text, View } from 'react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { IconProps } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';

interface Props {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
}

export const EmptyListPlaceholder = ({ icon: Icon, title }: Props) => {
  return (
    <View style={centerStyle}>
      <Icon size={80} color={ColorMap.placeholderIconColor} weight={'thin'} />
      <Text style={emptyListTextStyle}>{title}</Text>
    </View>
  );
};
