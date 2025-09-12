import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
export interface TokenToggleItemStyles {
  container: ViewStyle;
  leftContentWrapperStyle: ViewStyle;
  itemTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<TokenToggleItemStyles>({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
      paddingTop: theme.padding - 2,
      paddingBottom: theme.paddingXS - 2,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
    },
    leftContentWrapperStyle: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    itemTextStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextLight1,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXL + 4,
    },
  });
