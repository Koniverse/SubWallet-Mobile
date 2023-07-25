import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  footer: ViewStyle;
  body: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      display: 'flex',
      width: '100%',
      flex: 1,
      marginTop: Platform.OS === 'ios' ? 0 : 8,
    },
    body: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.padding,
    },
    footer: {
      marginTop: theme.margin,
      marginBottom: theme.margin,
      marginHorizontal: theme.margin,
    },
  });
};
