import React, { useMemo } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { sharedStyles } from "styles/sharedStyles";
import { useSubWalletTheme } from "hooks/useSubWalletTheme";

interface InputProps extends TextInputProps {

}

export const Input = (inputProps: InputProps) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(() => StyleSheet.create({
        inputContainer: {
          borderRadius: 8,
          width: '100%',
          backgroundColor: theme.inputBackground,
          color: theme.textColor2,
        },
  }), [theme]);
  return (
    <TextInput
      style={[sharedStyles.textInput, styles.inputContainer]}
      placeholder='Add password'
      placeholderTextColor={theme.textColor2}
      selectionColor={theme.textColor2}
      {...inputProps}
    />
  );
}
