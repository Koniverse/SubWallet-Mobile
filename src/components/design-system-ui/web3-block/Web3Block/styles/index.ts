import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  left: ViewStyle;
  middle: ViewStyle;
  right: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      display: 'flex',
      flexDirection: 'row',
      paddingHorizontal: theme.paddingSM,
      paddingVertical: theme.padding - 2,
    },
    left: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.paddingXS,
    },
    middle: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      width: 200, // Can apply any value not too long
    },
    right: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: -theme.marginXS,
    },
  });
};
