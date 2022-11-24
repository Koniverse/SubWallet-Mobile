import React from 'react';
import { ActivityIndicator, StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { CaretRight, IconProps } from 'phosphor-react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  hasRightArrow?: boolean;
  isBusy?: boolean;
  loadingLeftIcon?: boolean;
  leftIcon?: (iconProps: IconProps) => JSX.Element;
  disabledColor?: string;
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
    paddingLeft: 16,
    paddingRight: 16,
    ...style,
  };
}

function getTextStyle(color: string = ColorMap.light, isShowLeftIcon: boolean) {
  return {
    ...sharedStyles.mediumText,
    ...FontMedium,
    color,
    paddingLeft: isShowLeftIcon ? 10 : 0,
  };
}

function disabledOverlayStyle(color?: string): StyleProp<any> {
  return {
    position: 'absolute',
    right: 0,
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 5,
    backgroundColor: color ? color : ColorMap.disabledOverlay,
  };
}

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

const LoadingLeftIconStyle: StyleProp<any> = {
  marginRight: 10,
};

export const SubmitButton = (buttonProps: ButtonProps) => {
  const {
    leftIcon: LeftIcon,
    title,
    backgroundColor,
    loadingLeftIcon,
    color,
    style,
    hasRightArrow,
    disabled,
    isBusy,
    disabledColor,
  } = buttonProps;

  return (
    <TouchableOpacity
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...buttonProps}
      disabled={disabled || isBusy}
      style={getWrapperStyle(backgroundColor, style)}>
      {loadingLeftIcon && (
        <ActivityIndicator animating={true} size={'small'} color={ColorMap.light} style={LoadingLeftIconStyle} />
      )}
      {!!LeftIcon && <LeftIcon size={20} weight={'bold'} color={ColorMap.light} />}
      <Text style={getTextStyle(color, !!LeftIcon)}>{title}</Text>
      {hasRightArrow && (
        <View style={iconStyle}>
          <CaretRight size={20} color={color || ColorMap.light} weight={'bold'} />
        </View>
      )}
      {(disabled || isBusy) && <View style={disabledOverlayStyle(disabledColor)} />}
      {isBusy && <Loading width={32} height={32} style={loadingStyle} />}
    </TouchableOpacity>
  );
};
