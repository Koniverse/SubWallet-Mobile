import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSize0, sharedStyles } from 'styles/sharedStyles';

interface Props extends TextInputProps {
  inputValue: string;
  isDisabled?: boolean;
  label: string;
  editAccountInputStyle?: object;
  outerInputStyle?: object;
}

export const EditAccountInputText = (inputProps: Props) => {
  const { inputValue, isDisabled = false, label, editAccountInputStyle, outerInputStyle } = inputProps;
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputWrapper: {
          backgroundColor: theme.background2,
          width: '100%',
          borderRadius: 5,
          height: 64,
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 10,
          justifyContent: 'center',
        },
        labelStyle: {
          ...sharedStyles.smallText,
          ...FontSize0,
          lineHeight: 25,
          fontWeight: '500',
          color: theme.textColor2,
        },
        inputStyle: {
          ...sharedStyles.mainText,
          lineHeight: 0,
          paddingTop: 5,
          paddingBottom: 5,
          fontWeight: '500',
          color: theme.textColor,
        },
      }),
    [theme],
  );
  return (
    <View style={[styles.inputWrapper, editAccountInputStyle]}>
      <Text style={styles.labelStyle}>{label}</Text>
      <TextInput
        style={[styles.inputStyle, outerInputStyle]}
        value={inputValue}
        {...inputProps}
        editable={!isDisabled}
        selectTextOnFocus={!isDisabled}
      />
    </View>
  );
};
