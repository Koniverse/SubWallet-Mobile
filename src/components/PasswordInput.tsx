import React from 'react';
import { StyleProp, Text, TextInput, TextInputProps, View } from 'react-native';
import { FontSize0, sharedStyles, FontMedium } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';

interface InputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<any>;
}

const getInputContainerStyle: StyleProp<any> = (style: StyleProp<any> = {}) => {
  return {
    borderRadius: 5,
    backgroundColor: ColorMap.dark1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    height: 64,
    ...style,
  };
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
  ...FontMedium,
  color: ColorMap.light,
  textAlignVertical: 'top',
};

export const PasswordInput = (inputProps: InputProps) => {
  const { containerStyle, label } = inputProps;
  const theme = useSubWalletTheme().colors;

  return (
    <View style={getInputContainerStyle(containerStyle)}>
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
