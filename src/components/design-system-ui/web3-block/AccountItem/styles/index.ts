import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  containerSelected: ViewStyle;
  address: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    containerSelected: {
      backgroundColor: theme.colorBgInput,
    },
    address: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.lineHeightLG,
      fontWeight: `${theme.fontWeightStrong}`,
      color: theme.colorTextLight1,
    },
  });
};
