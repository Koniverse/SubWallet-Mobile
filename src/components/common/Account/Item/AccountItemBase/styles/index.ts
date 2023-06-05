import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  middle: ViewStyle;
  container: ViewStyle;
  right: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      minHeight: 52,
      paddingTop: 0,
      paddingBottom: 0,
      alignItems: 'center',
    },
    middle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    right: {
      marginRight: theme.marginXXS - 2,
    },
  });
};
