import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    amountValueConverter: {
      justifyContent: 'center',
    },
    footer: {
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      gap: theme.size,
      ...MarginBottomForSubmitButton,
    },
    footerBalanceWrapper: {
      marginBottom: -theme.margin,
    },
    max: {
      width: 40,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    maxText: {
      color: theme.colorSuccess,
    },
    row: {
      flexDirection: 'row',
      gap: theme.sizeSM,
      marginBottom: theme.marginSM,
    },
    subheader: {
      paddingTop: theme.padding,
    },
    accountSelector: {
      marginBottom: theme.margin,
    },
    scrollView: {
      flex: 1,
      marginTop: theme.margin,
    },
    scrollViewContentContainer: {
      paddingHorizontal: theme.padding,
    },
    brief: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      textAlign: 'center',
      marginBottom: theme.marginMD,
    },
    paperPlaneIconWrapper: {
      justifyContent: 'center',
    },
    rowItem: {
      flex: 1,
    },
    amountWrapper: {
      paddingTop: 48,
    },
    selector: {
      marginBottom: 0,
    },
    balanceWrapper: {
      gap: theme.size,
    },
    // Extension `.free-balance-block`: right-aligned "Sender available balance" under the form
    balance: {
      marginBottom: 0,
      flex: 1,
      justifyContent: 'flex-end',
    },
    balanceStep2: {
      paddingTop: 16,
      flex: 1,
      marginBottom: 0,
    },
  });
