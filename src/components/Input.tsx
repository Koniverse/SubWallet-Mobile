import React from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';

interface InputProps extends TextInputProps {}

const inputContainer: StyleProp<any> = {
  borderRadius: 8,
  width: '100%',
  backgroundColor: ColorMap.inputBackground,
  color: ColorMap.disabled,
};

export const Input = (inputProps: InputProps) => {
  const theme = useSubWalletTheme().colors;

  return (
    <TextInput
      style={[sharedStyles.textInput, inputContainer]}
      placeholderTextColor={theme.textColor2}
      selectionColor={theme.textColor2}
      {...inputProps}
    />
  );
};
