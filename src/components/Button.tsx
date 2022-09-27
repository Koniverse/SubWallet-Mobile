import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';
import { IconProps } from 'phosphor-react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  color?: string;
  icon?: (iconProps: IconProps) => JSX.Element;
  textStyle?: StyleProp<any>;
}

function getButtonWrapperStyle(): StyleProp<any> {
  return {
    height: 40,
    minWidth: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  const { title, style, textStyle, color = ColorMap.secondary, icon: Icon } = buttonProps;

  return (
    <TouchableOpacity {...buttonProps} style={[style, getButtonWrapperStyle()]}>
      {!!Icon && <Icon size={20} color={color || ColorMap.light} weight={'bold'} />}
      <Text style={[getButtonTextStyle(color), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
