import { StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      minHeight: 48,
      position: 'relative',
    },
    inputLabel: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      marginBottom: -4,
      paddingTop: theme.paddingXS,
      paddingHorizontal: theme.sizeSM,
      color: theme.colorTextLight4,
    },
  });
