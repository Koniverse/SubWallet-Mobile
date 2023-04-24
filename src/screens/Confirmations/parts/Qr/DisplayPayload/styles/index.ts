import { StyleSheet, ViewStyle } from 'react-native';
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
      flexDirection: 'column',
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
      marginBottom: theme.marginXL,
      marginHorizontal: theme.margin,
    },
  });
};
