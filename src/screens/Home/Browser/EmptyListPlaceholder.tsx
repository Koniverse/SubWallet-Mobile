import React from 'react';
import { Text, View } from 'react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { IconProps } from 'phosphor-react-native';

interface Props {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
}
export const EmptyListPlaceholder = ({ icon: Icon, title }: Props) => {
  return (
    <View style={centerStyle}>
      <Icon size={80} color={'rgba(255, 255, 255, 0.3)'} weight={'thin'} />
      <Text style={emptyListTextStyle}>{title}</Text>
    </View>
  );
};
