import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  inputContainer: ViewStyle;
  addressContainer: ViewStyle;
  nameContainer: ViewStyle;
  body: ViewStyle;
  subTitle: TextStyle;
  description: TextStyle;
  highLight: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    inputContainer: {
      paddingHorizontal: theme.paddingSM,
      paddingTop: theme.paddingXS,
    },
    addressContainer: {
      paddingRight: 2,
      paddingLeft: theme.paddingSM,
      marginBottom: theme.marginLG,
    },
    nameContainer: {
      marginBottom: theme.marginXS,
      marginTop: theme.marginXXS,
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
    },
    description: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextDescription,
      textAlign: 'center',
    },
    highLight: {
      color: theme.colorLink,
      textDecorationLine: 'underline',
    },
  });
};
