import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  footer: ViewStyle;
  field: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    footer: {
      width: '100%',
      paddingHorizontal: theme.padding,
      marginBottom: theme.margin,
    },
    field: {
      width: '100%',
    },
  });
};
