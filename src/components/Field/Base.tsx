import React from 'react';
import { StyleProp, View, ViewProps } from 'react-native';
import Text from '../../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize0 } from 'styles/sharedStyles';

export interface FieldBaseProps extends ViewProps {
  label?: string;
  fieldBgc?: string;
  outerStyle?: StyleProp<any>;
}

function getWrapperStyle(backgroundColor: string): StyleProp<any> {
  return {
    backgroundColor,
    borderRadius: 5,
    marginBottom: 8,
  };
}

const labelStyle: StyleProp<any> = {
  ...FontSize0,
  ...FontMedium,
  lineHeight: 25,
  paddingHorizontal: 16,
  paddingTop: 4,
  color: ColorMap.disabled,
};

export const FieldBase = ({ children, label, fieldBgc, outerStyle, ...props }: FieldBaseProps) => {
  return (
    <View style={[getWrapperStyle(fieldBgc || ColorMap.dark2), outerStyle]} {...props}>
      {!!label && <Text style={labelStyle}>{label}</Text>}
      {children}
    </View>
  );
};
