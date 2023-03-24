import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import {FontMedium, FontSemiBold, sharedStyles} from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

export interface TokenGroupBalanceItemStyles {
  chainBalanceMainArea: ViewStyle;
  chainBalancePart1: ViewStyle;
  textStyle: TextStyle;
  chainBalanceMetaWrapper: ViewStyle;
  chainBalancePart2: ViewStyle;
  chainBalancePart2Wrapper: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<TokenGroupBalanceItemStyles>({
    chainBalanceMainArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: theme.padding - 2,
    },
    chainBalancePart1: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: theme.paddingSM,
      paddingRight: 2,
    },
    textStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: ColorMap.light,
      paddingBottom: 4,
    },

    chainBalanceMetaWrapper: {
      paddingLeft: 8,
    },
    chainBalancePart2: {
      alignItems: 'flex-end',
      paddingRight: 10,
      paddingLeft: 2,
    },
    chainBalancePart2Wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 10,
    },
  });
