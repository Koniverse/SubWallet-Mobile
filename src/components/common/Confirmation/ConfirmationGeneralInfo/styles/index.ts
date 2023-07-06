import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export interface ComponentStyle {
  container: ViewStyle;
  text: TextStyle;
}

export default (theme: ThemeTypes, gap: number) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      display: 'flex',
      alignItems: 'center',
      marginTop: gap,
    },
    text: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.lineHeightHeading6 * theme.fontSizeHeading6,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
  });
};
