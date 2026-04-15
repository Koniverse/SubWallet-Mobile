import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  infoContainer: ViewStyle;
  infoRow: ViewStyle;
  accountRow: ViewStyle;
  accountText: TextStyle;
  infoText: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    infoContainer: {
      marginLeft: 10,
    },
    infoRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeSM,
      overflow: 'hidden',
      paddingVertical: theme.paddingXS,
    },
    accountRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
    },
    accountText: {
      ...FontMedium,
      color: theme.colorTextBase,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      flex: 1,
      flexShrink: 1,
    },
    infoText: {
      ...FontMedium,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
  });
};
