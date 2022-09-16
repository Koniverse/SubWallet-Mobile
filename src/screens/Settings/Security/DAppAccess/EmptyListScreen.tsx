import React from 'react';
import { Text, View } from 'react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { IconProps } from 'phosphor-react-native';

interface Props {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
}

export const EmptyListScreen = ({ icon: Icon, title }: Props) => {
  return (
    <View style={centerStyle}>
      <Icon size={80} color={ColorMap.disabled} weight={'regular'} />
      <Text style={emptyListTextStyle}>{title}</Text>
    </View>
  );
};
