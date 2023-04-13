import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface StakingPoolItemStyle {
  container: ViewStyle;
  avatarWrapper: ViewStyle;
  contentWrapper: ViewStyle;
  poolNameTextStyle: TextStyle;
  bondedAmountLabelTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<StakingPoolItemStyle>({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingVertical: 14,
      paddingLeft: 12,
      paddingRight: 4,
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    contentWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarWrapper: { alignItems: 'center', marginRight: theme.marginXS },
    poolNameTextStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorWhite,
      ...FontSemiBold,
      maxWidth: 200,
    },
    bondedAmountLabelTextStyle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
  });
