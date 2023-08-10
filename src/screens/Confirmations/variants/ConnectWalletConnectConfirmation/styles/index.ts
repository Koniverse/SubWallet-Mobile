import { StyleSheet, TextStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  text: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      width: '100%',
      ...FontSemiBold,
      paddingBottom: theme.padding,
    },
  });
};
