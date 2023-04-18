import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface ApplyMasterPasswordStyle {
  bodyWrapper: ViewStyle;
  footerAreaStyle: ViewStyle;
  titleStyle: TextStyle;
  messageStyle: TextStyle;
  headerTextStyle: TextStyle;
  applyDoneContainer: ViewStyle;
  applyDoneTitle: TextStyle;
  applyDoneMessage: TextStyle;
  applyDoneText: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ApplyMasterPasswordStyle>({
    bodyWrapper: { paddingHorizontal: theme.padding, flex: 1 },
    footerAreaStyle: {
      marginTop: theme.marginXS,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
    titleStyle: {
      paddingTop: theme.padding,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight2,
      ...FontSemiBold,
    },
    messageStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight3,
      textAlign: 'center',
      ...FontMedium,
      paddingHorizontal: 40,
      paddingTop: theme.padding,
    },
    headerTextStyle: {
      fontSize: theme.fontSizeXL,
      lineHeight: theme.fontSizeXL * theme.lineHeightLG,
      color: theme.colorTextLight1,
      ...FontSemiBold,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 40,
    },
    applyDoneContainer: { flex: 1, paddingTop: theme.padding, alignItems: 'center', paddingHorizontal: theme.padding },
    applyDoneTitle: {
      paddingVertical: 16,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight2,
      ...FontSemiBold,
    },
    applyDoneMessage: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight3,
      ...FontMedium,
      textAlign: 'center',
      paddingHorizontal: 40,
      paddingBottom: 32,
    },
    applyDoneText: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight3,
      ...FontMedium,
      textAlign: 'center',
    },
  });
