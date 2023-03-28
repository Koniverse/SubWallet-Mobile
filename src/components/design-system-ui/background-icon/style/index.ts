import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface BackgroundIconStyle {
  noneIcon: ViewStyle;
  defaultIcon: ViewStyle;
  squareIcon: ViewStyle;
  circleIcon: ViewStyle;
  squircleIcon: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<BackgroundIconStyle>({
    noneIcon: {},
    defaultIcon: {
      padding: 4,
      borderTopLeftRadius: theme.borderRadius,
      borderTopRightRadius: theme.borderRadius,
      borderBottomRightRadius: theme.borderRadius,
      borderBottomLeftRadius: theme.borderRadius,
    },
    squareIcon: {
      padding: 4,
      borderRadius: 0,
    },
    circleIcon: {
      padding: 4,
      borderTopLeftRadius: 999,
      borderTopRightRadius: 999,
      borderBottomRightRadius: 999,
      borderBottomLeftRadius: 999,
    },
    squircleIcon: {
      padding: 4,
      borderRadius: 0,
    },
  });
