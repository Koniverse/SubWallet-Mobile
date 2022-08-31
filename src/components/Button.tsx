import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  color?: string;
}

function getButtonWrapperStyle(): StyleProp<any> {
  return {
    minHeight: 40,
    justifyContent: 'center',
  };
}

function getButtonTextStyle(color: string): StyleProp<any> {
  return {
    color: color,
    textAlign: 'center',
    ...sharedStyles.mainText,
    ...FontSemiBold,
  };
}

export const Button = (buttonProps: ButtonProps) => {
  const { title, style, color = ColorMap.secondary } = buttonProps;

  return (
    <TouchableOpacity {...buttonProps}>
      <View style={[style, getButtonWrapperStyle()]}>
        <Text style={getButtonTextStyle(color)}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
