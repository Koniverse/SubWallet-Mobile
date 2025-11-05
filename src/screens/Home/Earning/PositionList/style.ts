import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  refreshIndicator: ViewStyle;
  highlightText: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      paddingHorizontal: theme.padding,
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
