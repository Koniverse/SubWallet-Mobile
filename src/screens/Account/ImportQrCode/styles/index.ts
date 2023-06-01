import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export interface ComponentStyle {
  footer: ViewStyle;
  body: ViewStyle;
  subTitle: TextStyle;
  description: TextStyle;
  highLight: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    footer: {
      marginBottom: theme.marginXL,
      paddingHorizontal: theme.padding,
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      gap: 56,
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: theme.paddingXL,
    },
    subTitle: {
      paddingVertical: theme.padding,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextDescription,
      textAlign: 'center',
      ...FontMedium,
    },
    description: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextDescription,
      textAlign: 'center',
      ...FontMedium,
    },
    highLight: {
      color: theme.colorLink,
      textDecorationLine: 'underline',
    },
  });
};
