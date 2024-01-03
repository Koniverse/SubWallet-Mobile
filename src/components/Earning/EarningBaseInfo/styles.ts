import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      padding: theme.padding,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      gap: theme.sizeXS,
    },
  });
};
