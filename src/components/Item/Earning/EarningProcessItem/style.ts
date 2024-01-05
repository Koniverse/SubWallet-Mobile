import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  text: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      gap: theme.paddingSM,
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.paddingSM,
    },
    text: {
      ...FontSemiBold,
      color: theme['gray-3'],
    },
  });
};
