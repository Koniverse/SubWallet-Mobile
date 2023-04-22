import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  title: TextStyle;
  text: TextStyle;
  textField: ViewStyle;
  row: ViewStyle;
  row1column1: ViewStyle;
  row1column2: ViewStyle;
  row2column: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    textField: {
      display: 'flex',
      flexDirection: 'row',
      padding: theme.paddingSM,
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    text: {
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    title: {
      color: theme.colorTextBase,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.sizeSM,
    },
    row1column1: {
      flex: 16,
    },
    row1column2: {
      flex: 8,
    },
    row2column: {
      flex: 12,
    },
  });
};
