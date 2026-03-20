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
      alignItems: 'center',
      gap: theme.paddingXS,
    },
    left: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
    },
    right: {
      marginLeft: theme.paddingXS,
      flexShrink: 0,
      alignItems: 'flex-end',
      maxWidth: 190,
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
      color: theme.colorWhite,
      paddingRight: theme.paddingXXS,
      flexShrink: 1,
      minWidth: 0,
      maxWidth: 120,
    },
    accountDetailValue: {
      color: theme.colorTextTertiary,
      paddingRight: theme.paddingXS,
      flexShrink: 0,
    },
    explorerBtn: { marginBottom: -4, marginTop: theme.marginXXS },
    accountInfoWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.paddingXS,
      flex: 1,
      minWidth: 0,
    },
    accountNameAndAddressWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },
  });
};
