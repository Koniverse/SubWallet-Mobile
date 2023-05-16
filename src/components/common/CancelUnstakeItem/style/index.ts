import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface CancelUnstakeItemStyle {
  container: ViewStyle;
  textStyle: TextStyle;
  subTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CancelUnstakeItemStyle>({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    textStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorWhite,
      ...FontSemiBold,
    },
    subTextStyle: {
      paddingLeft: 4,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
    },
  });
