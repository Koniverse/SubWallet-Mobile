import { StyleSheet, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  refreshIndicator: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      paddingHorizontal: theme.padding,
      gap: theme.sizeXS,
      paddingBottom: theme.paddingXS,
    },
    refreshIndicator: {
      backgroundColor: ColorMap.dark1,
    },
  });
};
