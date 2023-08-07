import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
      flexDirection: 'row',
      height: 48,
      paddingHorizontal: theme.paddingXXS,
    },
    iconWrapper: {
      paddingHorizontal: theme.paddingXS,
    },
    text: { color: theme.colorTextLight4 },
  });
