import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  text: TextStyle;
  description: TextStyle;
  highlight: TextStyle;
  accountBlockContainer: ViewStyle;
  message: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      textAlign: 'center',
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
      color: theme.colorTextBase,
      ...FontSemiBold,
    },
    description: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      paddingHorizontal: theme.padding,
    },
    highlight: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorWarning,
      ...FontMedium,
    },
    accountBlockContainer: {
      opacity: 0.4,
    },
    message: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
      color: theme.colorTextTertiary,
    },
  });
};
