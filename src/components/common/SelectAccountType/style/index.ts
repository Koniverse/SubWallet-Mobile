import { StyleSheet, TextStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface SelectAccountTypeStyles {
  titleStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<SelectAccountTypeStyles>({
    titleStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight * theme.fontSize,
      color: theme.colorTextLight4,
      ...FontSemiBold,
      paddingBottom: theme.padding,
    },
  });
