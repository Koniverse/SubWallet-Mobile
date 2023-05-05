import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  description: TextStyle;
}

const createStyles = (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingVertical: theme.paddingSM + 2,
      paddingRight: theme.paddingXS,
      paddingLeft: theme.paddingSM,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS + 2,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeXXS,
      flex: 1,
    },
    title: {
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.lineHeightHeading5 * theme.fontSizeHeading5,
    },
    description: {
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.lineHeightHeading6 * theme.fontSizeHeading6,
      color: theme.colorTextDescription,
    },
  });
};

export default createStyles;
