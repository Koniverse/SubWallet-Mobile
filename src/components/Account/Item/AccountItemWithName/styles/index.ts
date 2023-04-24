import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  contentWrapper: ViewStyle;
  contentDirectionHorizontal: ViewStyle;
  contentDirectionVertical: ViewStyle;
  accountName: TextStyle;
  accountAddress: TextStyle;
  accountAddressHorizontal: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    contentWrapper: {
      display: 'flex',
    },
    contentDirectionHorizontal: {
      flexDirection: 'row',
    },
    contentDirectionVertical: {
      flexDirection: 'column',
    },
    accountAddress: {
      fontWeight: `${theme.fontWeightStrong}`,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextDescription,
    },
    accountAddressHorizontal: {
      marginLeft: theme.marginXXS,
    },
    accountName: {
      fontWeight: `${theme.fontWeightStrong}`,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      color: theme.colorTextBase,
      marginLeft: theme.marginXXS,
    },
  });
};
