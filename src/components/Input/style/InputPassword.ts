import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes, showEyeButton?: boolean) =>
  StyleSheet.create({
    eyeButton: {
      marginRight: theme.marginXXS,
    },
    inputStyle: {
      paddingRight: showEyeButton ? 40 + theme.sizeXXS : undefined,
    },
  });
