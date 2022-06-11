import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import React from 'react';
import { CaretRight, IconProps } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface ActionItemProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  hasRightArrow?: boolean;
  isBusy?: boolean;
  icon: (iconProps: IconProps) => JSX.Element;
}

function getWrapperStyle(backgroundColor: string = ColorMap.dark2, style: StyleProp<any> = {}): StyleProp<any> {
  return {
    position: 'relative',
    height: 52,
    borderRadius: 4,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 52,
    paddingRight: 20,
    ...style,
  };
}

function getTextStyle(color: string = ColorMap.light) {
  return {
    ...sharedStyles.largerText,
    ...FontSemiBold,
    fontSize: 18,
    color,
  };
}

const iconStyle: StyleProp<any> = {
  position: 'absolute',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  width: 52,
};

const arrowStyle: StyleProp<any> = {
  position: 'absolute',
  right: 16,
};

export const ActionItem = (actionProps: ActionItemProps) => {
  const { icon: Icon, color, title, backgroundColor, style, hasRightArrow } = actionProps;

  return (
    <TouchableOpacity activeOpacity={0.5} {...actionProps} style={getWrapperStyle(backgroundColor, style)}>
      <View style={iconStyle}>
        <Icon size={20} color={color || '#fff'} weight={'bold'} />
      </View>
      <Text style={getTextStyle(color)}>{title}</Text>
      {hasRightArrow && (
        <View style={arrowStyle}>
          <CaretRight size={20} color={color || '#fff'} weight={'bold'} />
        </View>
      )}
    </TouchableOpacity>
  );
};
