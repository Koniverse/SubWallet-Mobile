import React from 'react';
import { StyleProp, Text } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';

interface Props extends FieldBaseProps {
  text: string;
}

const textStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
  paddingHorizontal: 16,
  paddingBottom: 10,
  color: ColorMap.light,
};

export const TextField = ({ text, ...fieldBase }: Props) => {
  return (
    <FieldBase {...fieldBase}>
      <Text style={textStyle}>{text}</Text>
    </FieldBase>
  );
};
