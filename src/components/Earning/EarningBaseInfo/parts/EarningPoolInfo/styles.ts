import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  header: ViewStyle;
  headerBottom: ViewStyle;
  headerText: TextStyle;
  infoContainer: ViewStyle;
  infoRow: ViewStyle;
  accountRow: ViewStyle;
  accountText: TextStyle;
  infoText: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginRight: -theme.margin,
      alignItems: 'center',
    },
    headerBottom: {
      marginBottom: -theme.marginSM,
    },
    headerText: {
      ...FontSemiBold,
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
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
    },
    accountRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      overflow: 'hidden',
      flex: 1,
    },
    accountText: {
      ...FontMedium,
      color: theme.colorTextBase,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    infoText: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
  });
};
