import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.sizeSM,
      paddingHorizontal: theme.padding,
      paddingVertical: theme.padding,
      width: '100%',
    },
  });
};
