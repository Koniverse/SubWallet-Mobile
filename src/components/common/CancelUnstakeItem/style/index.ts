import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { UnstakingStatus } from '@subwallet/extension-base/background/KoniTypes';

export interface CancelUnstakeItemStyle {
  container: ViewStyle;
  textStyle: TextStyle;
  subTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CancelUnstakeItemStyle>({
    container: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginHorizontal: 16,
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
