import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (theme: ThemeTypes) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    input: {
      textAlign: 'center',
      fontSize: 38,
      lineHeight: 40,
      paddingTop: 0,
      paddingBottom: 0,
      height: 62,
    },
  });
