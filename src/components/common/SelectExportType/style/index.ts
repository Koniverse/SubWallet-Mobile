import { StyleSheet, TextStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export interface SelectExportTypeStyles {
  titleStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<SelectExportTypeStyles>({
    titleStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight * theme.fontSize,
      color: theme.colorTextLight4,
      ...FontMedium,
      paddingBottom: theme.padding,
    },
  });
