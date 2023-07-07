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
      flexDirection: 'row',
      marginTop: -theme.margin,
      marginBottom: -theme.margin,
    },
    max: {
      padding: theme.padding,
      marginRight: -theme.margin,
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
      flexDirection: 'row',
    },
    balance: {
      paddingTop: theme.padding,
      marginBottom: 0,
      flex: 1,
    },
  });
