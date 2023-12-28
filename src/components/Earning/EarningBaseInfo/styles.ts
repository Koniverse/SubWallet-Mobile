import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  header: ViewStyle;
  headerTop: ViewStyle;
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
    wrapper: {
      padding: theme.padding,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      gap: theme.sizeXS,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginRight: -theme.margin,
      alignItems: 'center',
    },
    headerTop: {
      marginTop: -theme.marginSM,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.sizeSM,
    },
    accountRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
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
