import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ColorMap } from 'styles/color';
import {FontBold, FontMedium, sharedStyles} from 'styles/sharedStyles';
import Loading from 'components/Loading';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  hasRightArrow?: boolean;
  isBusy?: boolean;
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
  };
}

const disabledOverlay: StyleProp<any> = {
  position: 'absolute',
  right: 0,
  top: 0,
  left: 0,
  bottom: 0,
  borderRadius: 8,
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
  const { title, backgroundColor, color, style, hasRightArrow, disabled, isBusy } = buttonProps;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      {...buttonProps}
      disabled={disabled || isBusy}
      style={getWrapperStyle(backgroundColor, style)}>
      <Text style={getTextStyle(color)}>{title}</Text>
      {hasRightArrow && (
        <View style={iconStyle}>
          <FontAwesomeIcon icon={faChevronRight} size={15} color={color || ColorMap.light} />
        </View>
      )}
      {(disabled || isBusy) && <View style={disabledOverlay} />}
      {isBusy && <Loading width={32} height={32} style={loadingStyle} />}
    </TouchableOpacity>
  );
};
