import Text from 'components/Text';
import { View } from 'react-native';
import React from 'react';
import { ColorMap } from 'styles/color';
import { IconProps } from 'phosphor-react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';

interface Props {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
}

export const EmptyList = ({ icon: Icon, title }: Props) => {
  return (
    <View style={centerStyle}>
      <Icon size={80} color={ColorMap.disabled} weight={'thin'} />
      <Text style={emptyListTextStyle}>{title}</Text>
    </View>
  );
};
