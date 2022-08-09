import React from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface InputProps extends TextInputProps {}

const inputContainer: StyleProp<any> = {
  borderRadius: 8,
  width: '100%',
  backgroundColor: ColorMap.inputBackground,
  color: ColorMap.disabled,
};

export const Input = (inputProps: InputProps) => {
  return (
    <TextInput
      autoCorrect={false}
      style={[sharedStyles.textInput, inputContainer]}
      placeholderTextColor={ColorMap.disabled}
      selectionColor={ColorMap.disabled}
      {...inputProps}
    />
  );
};
