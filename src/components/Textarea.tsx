import React, {useMemo} from "react";
import {StyleSheet, TextInput} from "react-native";
import {sharedStyles} from "styles/sharedStyles";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";

export const Textarea = () => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(() => StyleSheet.create({
    textAreaWrapper: {
      backgroundColor: theme.inputBackground,
      width: '100%',
      color: theme.textColor2,
    }
  }), []);

  return (
    <TextInput
      autoCapitalize='none'
      style={[sharedStyles.inputAreaStyle, styles.textAreaWrapper]}
      multiline={true}
    />
  );
}
