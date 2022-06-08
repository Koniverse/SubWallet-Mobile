import React, {useMemo} from "react";
import {StyleSheet, TextInput} from "react-native";
import {sharedStyles} from "utils/sharedStyles";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";

export const Input = () => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(() => StyleSheet.create({
    inputContainer: {
      borderRadius: 8,
      width: '100%',
      backgroundColor: theme.inputBackground,
      color: theme.textColor2,
    }
  }), [theme]);
  return (
    <TextInput
      style={[sharedStyles.textInput, styles.inputContainer]}
      placeholder='Add password'
      placeholderTextColor={theme.textColor2}
      selectionColor={theme.textColor2}
    />
  );
}
