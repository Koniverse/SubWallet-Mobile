import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    buttonText: {
      color: theme.colorSuccess,
    },
    input: {},
  });
