import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  content: ViewStyle;
}

export default (theme: ThemeTypes, gap = 20) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      paddingHorizontal: theme.padding,
      marginTop: theme.padding,
      width: '100%',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: gap,
    },
  });
};
