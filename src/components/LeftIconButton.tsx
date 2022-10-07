import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import React from 'react';
import Text from '../components/Text';
import { IconProps } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface ActionItemProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  icon: (iconProps: IconProps) => JSX.Element;
}

function getWrapperStyle(
  backgroundColor: string = 'transparent',
  disabled: boolean,
  style: StyleProp<any> = {},
): StyleProp<any> {
  return {
    position: 'relative',
    height: 40,
    borderRadius: 5,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 10,
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
}

function getTextStyle(color: string = ColorMap.light) {
  return {
    ...sharedStyles.mainText,
    ...FontMedium,
    color,
  };
}

const iconStyle: StyleProp<any> = {
  position: 'absolute',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  width: 40,
};

export const LeftIconButton = (actionProps: ActionItemProps) => {
  const { icon: Icon, color, title, backgroundColor, style, disabled } = actionProps;

  return (
    <TouchableOpacity
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...actionProps}
      style={getWrapperStyle(backgroundColor, !!disabled, style)}>
      <View style={iconStyle}>
        <Icon size={20} color={color || ColorMap.light} weight={'bold'} />
      </View>
      <Text style={getTextStyle(color)}>{title}</Text>
    </TouchableOpacity>
  );
};
