import { StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    fakeSearch: {
      margin: theme.margin,
    },
  });
