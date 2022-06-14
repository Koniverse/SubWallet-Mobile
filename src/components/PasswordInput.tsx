import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import {FontSize0, sharedStyles} from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';

interface InputProps extends TextInputProps {
  label: string;
}

const inputContainerStyle: StyleProp<any> = {
  borderRadius: 5,
  backgroundColor: ColorMap.dark1,
  width: '100%',
  paddingHorizontal: 16,
  paddingTop: 4,
  height: 64,
};

const inputLabelStyle: StyleProp<any> = {
  textTransform: 'uppercase',
  ...sharedStyles.smallText,
  ...FontSize0,
  color: ColorMap.disabled,
};

const inputStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  lineHeight: 0,
  paddingTop: 5,
  paddingBottom: 5,
  fontWeight: '500',
  color: ColorMap.light,
};

export const PasswordInput = (inputProps: InputProps) => {
  const { label } = inputProps;
  const theme = useSubWalletTheme().colors;

  return (
    <View style={inputContainerStyle}>
      <Text style={inputLabelStyle}>{label}</Text>
      <TextInput
        style={inputStyle}
        placeholderTextColor={theme.textColor2}
        selectionColor={theme.textColor2}
        secureTextEntry
        {...inputProps}
      />
    </View>
  );
};
