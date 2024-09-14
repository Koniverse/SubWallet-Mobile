import { StyleSheet, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  refreshIndicator: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      paddingBottom: theme.padding,
    },
    container: {
      paddingHorizontal: theme.padding,
      paddingBottom: theme.paddingXS,
    },
    refreshIndicator: {
      backgroundColor: ColorMap.dark1,
    },
  });
};
