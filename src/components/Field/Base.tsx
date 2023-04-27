import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import Text from '../../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize0 } from 'styles/sharedStyles';

export interface FieldBaseProps extends ViewProps {
  label?: string;
  fieldBgc?: string;
  outerStyle?: StyleProp<ViewStyle>;
}

function getWrapperStyle(backgroundColor: string): StyleProp<any> {
  return {
    backgroundColor,
    borderRadius: 8,
    marginBottom: 8,
  };
}

const labelStyle: StyleProp<any> = {
  ...FontSize0,
  ...FontMedium,
  lineHeight: 22,
  paddingHorizontal: 12,
  paddingTop: 4,
  color: ColorMap.disabled,
};

export const FieldBase = ({ children, label, fieldBgc, outerStyle, ...props }: FieldBaseProps) => {
  return (
    <View style={[getWrapperStyle(fieldBgc || '#1A1A1A'), outerStyle]} {...props}>
      {!!label && <Text style={labelStyle}>{label}</Text>}
      {children}
    </View>
  );
};
