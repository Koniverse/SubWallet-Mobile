import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface SelectAccountTypeStyle {
  container: ViewStyle;
  accountNameStyle: TextStyle;
  accountAddressStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<SelectAccountTypeStyle>({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      paddingVertical: theme.paddingXS,
      paddingHorizontal: theme.padding,
      borderRadius: 32,
      opacity: 0.8,
    },
    accountNameStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      paddingHorizontal: theme.paddingXS,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    accountAddressStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      paddingRight: theme.paddingXS,
      ...FontMedium,
    },
  });
