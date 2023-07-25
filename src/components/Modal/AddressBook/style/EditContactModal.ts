import { ThemeTypes } from 'styles/themes';
import { Platform, StyleSheet } from 'react-native';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    formContainer: {
      width: '100%',
      gap: theme.sizeSM,
    },
    buttonGroupContainer: {
      flexDirection: 'row',
      gap: theme.sizeSM,
      marginBottom: Platform.OS === 'ios' ? theme.margin : 0,
    },
    button: {
      flex: 1,
    },
  });
