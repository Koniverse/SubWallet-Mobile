import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface InputAmountStyles {
  container: ViewStyle;
  inputTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<InputAmountStyles>({
    container: {
      backgroundColor: theme.colorBgSecondary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.paddingXXS,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.marginXS,
      height: 48,
    },
    inputTextStyle: {
      padding: 0,
      textAlignVertical: 'top',
      fontSize: theme.fontSize,
      ...FontMedium,
      color: theme.colorTextTertiary,
      flex: 1,
    },
  });
