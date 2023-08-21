import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  wrapperDisable: ViewStyle;
  left: ViewStyle;
  text: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      borderRadius: theme.borderRadiusLG,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.paddingSM,
      paddingVertical: theme.paddingSM + 2,
      backgroundColor: theme.colorBgSecondary,
    },
    wrapperDisable: {
      opacity: theme.opacityDisable,
    },
    text: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextBase,
      flex: 1,
    },
    left: {
      marginRight: 12,
    },
  });
};
