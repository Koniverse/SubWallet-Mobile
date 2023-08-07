import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes, showMaxButton?: boolean) =>
  StyleSheet.create({
    buttonText: {
      color: theme.colorSuccess,
    },
    input: {
      paddingRight: showMaxButton ? 56 : undefined,
    },
  });
