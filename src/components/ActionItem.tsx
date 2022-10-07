import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import React from 'react';
import Text from 'components/Text';
import { CaretRight, IconProps } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface ActionItemProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  hasRightArrow?: boolean;
  // isBusy?: boolean;
  icon: (iconProps: IconProps) => JSX.Element;
  showIcon?: boolean;
  subTitle?: string;
  paddingLeft?: number;
  subTextColor?: string;
}

function getWrapperStyle(
  backgroundColor: string = ColorMap.dark2,
  style: StyleProp<any> = {},
  paddingLeft: number = 52,
): StyleProp<any> {
  return {
    position: 'relative',
    height: 52,
    borderRadius: 5,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft,
    paddingRight: 20,
    ...style,
  };
}

function getTextStyle(color: string = ColorMap.light) {
  return {
    ...sharedStyles.mediumText,
    ...FontSemiBold,
    fontSize: 18,
    color,
  };
}

function getSubTextStyle(color: string = ColorMap.disabled) {
  return {
    ...sharedStyles.mainText,
    ...FontMedium,
    color,
    paddingRight: 31,
    maxWidth: 150,
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
  const {
    icon: Icon,
    color,
    subTextColor,
    title,
    subTitle,
    backgroundColor,
    paddingLeft,
    style,
    showIcon = true,
    hasRightArrow,
  } = actionProps;

  return (
    <TouchableOpacity
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...actionProps}
      style={getWrapperStyle(backgroundColor, style, paddingLeft)}>
      {showIcon && (
        <View style={iconStyle}>
          <Icon size={20} color={color || ColorMap.light} weight={'bold'} />
        </View>
      )}
      <Text style={getTextStyle(color)}>{title}</Text>
      <Text style={getSubTextStyle(subTextColor)} numberOfLines={1}>
        {subTitle || ''}
      </Text>
      {hasRightArrow && (
        <View style={arrowStyle}>
          <CaretRight size={20} color={color || ColorMap.light} weight={'bold'} />
        </View>
      )}
    </TouchableOpacity>
  );
};
