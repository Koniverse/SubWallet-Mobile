import React from 'react';
import { StyleProp, Text, View, ViewProps } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize0 } from 'styles/sharedStyles';

export interface FieldBaseProps extends ViewProps {
  label: string;
}

const wrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  marginBottom: 8,
};

const labelStyle: StyleProp<any> = {
  ...FontSize0,
  ...FontMedium,
  lineHeight: 25,
  paddingHorizontal: 16,
  paddingTop: 4,
  color: ColorMap.disabled,
};

export const FieldBase = ({ children, label, ...props }: FieldBaseProps) => {
  return (
    <View style={wrapperStyle} {...props}>
      <Text style={labelStyle}>{label}</Text>
      {children}
    </View>
  );
};
