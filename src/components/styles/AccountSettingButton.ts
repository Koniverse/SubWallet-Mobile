import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: {
      gap: theme.sizeXS,
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      paddingHorizontal: theme.paddingXS,
    },
    placeholder: {
      backgroundColor: theme['gray-3'],
      width: 20,
      height: 20,
      borderRadius: 20,
      justifyContent: 'center',
    },
  });
};
