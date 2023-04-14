import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface StakingNominationItemStyle {
  container: ViewStyle;
  avatarWrapper: ViewStyle;
  contentWrapper: ViewStyle;
  nominationNameTextStyle: TextStyle;
  bondedAmountLabelTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<StakingNominationItemStyle>({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingVertical: theme.padding - 2,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.marginXS,
      marginHorizontal: theme.margin,
    },
    contentWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarWrapper: { alignItems: 'center', marginRight: theme.marginXS },
    nominationNameTextStyle: {
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
