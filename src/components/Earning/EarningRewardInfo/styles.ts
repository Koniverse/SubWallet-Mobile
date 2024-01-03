import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  infoContainer: ViewStyle;
  timeRow: ViewStyle;
  timeText: TextStyle;
  cancelWithdrawContainer: ViewStyle;
  withdrawButtonContainer: ViewStyle;
  withdrawSeparator: ViewStyle;
  totalUnstake: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    infoContainer: {
      marginLeft: 10,
    },
    timeRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    timeText: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
    },
    cancelWithdrawContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    withdrawButtonContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.sizeSM,
    },
    withdrawSeparator: {
      height: 2,
      backgroundColor: theme.colorBgDivider,
      marginBottom: -2,
    },
    totalUnstake: {
      ...FontSemiBold,
      lineHeight: theme.fontSizeHeading4,
    },
    // body: {
    //   flex: 1,
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   paddingHorizontal: theme.padding,
    // },
    // footer: {
    //   marginTop: theme.margin,
    //   marginHorizontal: theme.margin,
    // },
  });
};
