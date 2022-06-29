import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getIcon } from 'utils/index';
import { FontMedium } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props extends TouchableOpacityProps {
  label: string;
  iconName: string;
  iconSize: number;
  iconColor?: string;
}

const buttonContainerStyle: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginHorizontal: 15,
};

const buttonWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.secondary,
  width: 52,
  height: 52,
  borderRadius: 18,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

function getButtonTextStyle(disabled: boolean) {
  return {
    color: disabled ? ColorMap.disabled : ColorMap.light,
    fontSize: 15,
    lineHeight: 26,
    ...FontMedium,
    paddingTop: 8,
  };
}

const disabledOverlay: StyleProp<any> = {
  position: 'absolute',
  right: 0,
  top: 0,
  left: 0,
  bottom: 0,
  borderRadius: 18,
  backgroundColor: ColorMap.disabledOverlay,
};

const ActionButton = (actionButtonProps: Props) => {
  const { label, iconName, iconSize, iconColor, disabled } = actionButtonProps;
  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity style={buttonContainerStyle} {...actionButtonProps} disabled={disabled}>
        <View style={buttonWrapperStyle}>{getIcon(iconName, iconSize, iconColor || ColorMap.light)}</View>
        {disabled && <View style={disabledOverlay} />}
      </TouchableOpacity>
      <Text style={getButtonTextStyle(!!disabled)}>{label}</Text>
    </View>
  );
};

export default ActionButton;
