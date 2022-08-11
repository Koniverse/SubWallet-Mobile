import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Text from '../components/Text';
import { FontMedium } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props extends TouchableOpacityProps {
  label: string;
  icon: JSX.Element;
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
    color: disabled ? ColorMap.disabledTextColor : ColorMap.light,
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
  const { label, icon, disabled } = actionButtonProps;
  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity style={buttonContainerStyle} {...actionButtonProps} disabled={disabled} activeOpacity={0.5}>
        <View style={buttonWrapperStyle}>{icon}</View>
        {disabled && <View style={disabledOverlay} />}
      </TouchableOpacity>
      <Text style={getButtonTextStyle(!!disabled)}>{label}</Text>
    </View>
  );
};

export default ActionButton;
