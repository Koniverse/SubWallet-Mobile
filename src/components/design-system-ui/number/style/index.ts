import { StyleSheet, TextStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface NumberStyle {
  numberPrefix: TextStyle;
  numberSuffix: TextStyle;
  numberInteger: TextStyle;
  numberDecimal: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<NumberStyle>({
    numberPrefix: {
      color: theme.colorText,
    },
    numberSuffix: {
      color: theme.colorText,
    },
    numberInteger: {
      color: theme.colorText,
    },
    numberDecimal: {
      color: theme.colorText,
    },
  });
