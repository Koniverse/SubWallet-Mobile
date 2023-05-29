import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

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
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.marginXS,
      height: 48,
    },
    inputTextStyle: {
      fontSize: theme.fontSize,
      ...FontMedium,
      color: theme.colorTextTertiary,
      flex: 1,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
      borderTopLeftRadius: theme.borderRadiusLG,
      borderBottomLeftRadius: theme.borderRadiusLG,
      height: '100%',
    },
  });
