import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  text: TextStyle;
  description: TextStyle;
  highlight: TextStyle;
  accountBlockContainer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      textAlign: 'center',
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
      color: theme.colorTextBase,
      fontWeight: `${theme.fontWeightStrong}`,
    },
    description: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    highlight: {
      color: theme.colorWarning,
    },
    accountBlockContainer: {
      opacity: 0.4,
    },
  });
};
