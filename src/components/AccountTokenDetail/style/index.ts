import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.paddingXS,
    },
    value: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    textStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
    },
    subTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
    },
    accountDetailLabel: {
      maxWidth: 120,
      color: theme.colorWhite,
      paddingRight: theme.paddingXXS,
    },
    accountDetailValue: {
      color: theme.colorTextTertiary,
      paddingRight: theme.paddingXS,
    },
  });
};
