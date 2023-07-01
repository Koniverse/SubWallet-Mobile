import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  container: ViewStyle;
  itemMainTextStyle: TextStyle;
  itemSubTextStyle: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginHorizontal: theme.margin,
      paddingVertical: theme.paddingSM,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingLG - 2,
    },
    itemMainTextStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorWhite,
      ...FontSemiBold,
    },
    itemSubTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextTertiary,
      ...FontMedium,
      maxWidth: 132,
      paddingLeft: theme.paddingXS,
      paddingRight: theme.paddingXXS,
    },
  });
};
