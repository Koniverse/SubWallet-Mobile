import React from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

const textAreaWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  width: '100%',
  color: ColorMap.disabled,
};

interface Props extends TextInputProps {

}

export const Textarea = (textAreaProps: Props) => {
  const { style } = textAreaProps;
  return (
    <TextInput autoCapitalize="none" style={[sharedStyles.inputAreaStyle, textAreaWrapper, style]} multiline={true} />
  );
};
