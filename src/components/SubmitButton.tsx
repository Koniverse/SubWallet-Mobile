import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { BUTTON_ACTIVE_OPACITY } from '../constant';
import { CaretRight, IconProps } from 'phosphor-react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  hasRightArrow?: boolean;
  isBusy?: boolean;
  leftIcon?: (iconProps: IconProps) => JSX.Element;
}

function getWrapperStyle(backgroundColor: string = ColorMap.secondary, style: StyleProp<any> = {}): StyleProp<any> {
  return {
    position: 'relative',
    height: 52,
    borderRadius: 5,
    backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 32,
    paddingRight: 32,
    ...style,
  };
}

function getTextStyle(color: string = ColorMap.light) {
  return {
    ...sharedStyles.mediumText,
    ...FontBold,
    color,
    paddingLeft: 10,
  };
}

const disabledOverlay: StyleProp<any> = {
  position: 'absolute',
  right: 0,
  top: 0,
  left: 0,
  bottom: 0,
  borderRadius: 5,
  backgroundColor: ColorMap.disabledOverlay,
};

const iconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 14,
};

const loadingStyle: StyleProp<any> = {
  position: 'absolute',
  right: 0,
  top: 0,
  left: 0,
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
};

export const SubmitButton = (buttonProps: ButtonProps) => {
  const { leftIcon: LeftIcon, title, backgroundColor, color, style, hasRightArrow, disabled, isBusy } = buttonProps;

  return (
    <TouchableOpacity
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...buttonProps}
      disabled={disabled || isBusy}
      style={getWrapperStyle(backgroundColor, style)}>
      {!!LeftIcon && <LeftIcon size={20} weight={'bold'} color={ColorMap.light} />}
      <Text style={getTextStyle(color)}>{title}</Text>
      {hasRightArrow && (
        <View style={iconStyle}>
          <CaretRight size={20} color={color || ColorMap.light} weight={'bold'} />
        </View>
      )}
      {(disabled || isBusy) && <View style={disabledOverlay} />}
      {isBusy && <Loading width={32} height={32} style={loadingStyle} />}
    </TouchableOpacity>
  );
};
