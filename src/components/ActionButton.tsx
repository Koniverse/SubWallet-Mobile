import React, { useMemo } from 'react';
import {StyleProp, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getIcon } from 'utils/index';
import {FontMedium, FontRegular, FontSemiBold} from 'styles/sharedStyles';
import {ColorMap} from "styles/color";

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
  marginBottom: 8,
};

const buttonTextStyle: StyleProp<any> = {
  color: ColorMap.light,
  fontSize: 15,
  lineHeight: 26,
  ...FontMedium,
};

const ActionButton = (actionButtonProps: Props) => {
  const { label, iconName, iconSize, iconColor } = actionButtonProps;
  return (
    <TouchableOpacity style={buttonContainerStyle} {...actionButtonProps}>
      <View style={buttonWrapperStyle}>{getIcon(iconName, iconSize, iconColor || ColorMap.light)}</View>

      <Text style={buttonTextStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
