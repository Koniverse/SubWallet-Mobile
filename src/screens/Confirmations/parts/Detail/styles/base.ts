import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.size,
    },
  });
};
