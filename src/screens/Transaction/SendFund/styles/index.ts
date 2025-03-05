import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

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
      marginTop: -theme.margin,
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
    balance: {
      marginBottom: 0,
      flex: 1,
    },
    balanceStep2: {
      paddingTop: 16,
      flex: 1,
      marginBottom: 0,
    },
  });
