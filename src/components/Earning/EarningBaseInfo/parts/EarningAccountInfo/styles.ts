import { deviceWidth } from 'constants/index';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  header: ViewStyle;
  headerText: TextStyle;
  headerBottom: ViewStyle;
  infoWrapper: ViewStyle;
  infoContentWrapper: ViewStyle;
  infoContainer: ViewStyle;
  infoContainerMulti: ViewStyle;
  infoRow: ViewStyle;
  accountRow: ViewStyle;
  accountText: TextStyle;
  infoText: TextStyle;
  separator: ViewStyle;
  buttonDisable: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginRight: -theme.margin,
      marginTop: -theme.marginSM,
      alignItems: 'center',
    },
    headerText: {
      ...FontSemiBold,
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    headerBottom: {
      marginBottom: -theme.marginSM,
    },
    infoWrapper: {
      marginHorizontal: -theme.margin,
    },
    infoContentWrapper: {
      gap: theme.sizeSM,
      paddingHorizontal: theme.padding,
    },
    infoContainer: {
      marginLeft: 10,
    },
    infoContainerMulti: {
      width: deviceWidth - 90,
      backgroundColor: theme.colorBgDefault,
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
      maxWidth: 120,
    },
    infoText: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    separator: {
      height: 2,
      backgroundColor: theme.colorBgDivider,
      marginBottom: -2,
    },
    buttonDisable: {
      opacity: theme.opacityDisable,
    },
  });
};
