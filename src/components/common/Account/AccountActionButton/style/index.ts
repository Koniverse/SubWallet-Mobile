import { StyleSheet, TextStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface AccountActionButtonStyles {
  titleStyle: TextStyle;
  subTitleStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<AccountActionButtonStyles>({
    titleStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight1,
      ...FontSemiBold,
      paddingBottom: theme.paddingXXS,
      maxWidth: '100%',
    },
    subTitleStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight3,
      ...FontSemiBold,
      maxWidth: '100%',
    },
  });
