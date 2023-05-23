import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

export interface TokenGroupBalanceItemStyles {
  chainBalanceMainArea: ViewStyle;
  chainBalancePart1: ViewStyle;
  textStyle: TextStyle;
  chainBalanceMetaWrapper: ViewStyle;
  chainBalancePart2: ViewStyle;
  chainBalancePart2Wrapper: ViewStyle;
  iconWrapper: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<TokenGroupBalanceItemStyles>({
    chainBalanceMainArea: {
      flexDirection: 'row',
      width: '100%',
      overflow: 'hidden',
      height: 68,
      alignItems: 'center',
    },
    chainBalancePart1: {
      justifyContent: 'center',
      paddingLeft: theme.paddingSM,
    },

    chainBalanceMetaWrapper: {
      flex: 1,
      paddingLeft: theme.paddingXS,
      overflow: 'hidden',
    },

    textStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: ColorMap.light,
      overflow: 'hidden',
    },
    chainBalancePart2: {
      alignItems: 'flex-end',
      paddingLeft: theme.sizeXXS,
    },
    chainBalancePart2Wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.marginXXS,
      marginRight: theme.marginXXS,
    },
  });
