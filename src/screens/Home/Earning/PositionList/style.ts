import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  refreshIndicator: ViewStyle;
  highlightText: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      flex: 1,
      paddingBottom: theme.padding,
    },
    container: {
      paddingHorizontal: theme.padding,
      paddingBottom: theme.paddingXS,
    },
    refreshIndicator: {
      backgroundColor: ColorMap.dark1,
    },
    highlightText: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
  });
};
