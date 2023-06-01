import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

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
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontMedium,
    },
    description: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextDescription,
      ...FontMedium,
    },
  });
};

export default createStyles;
