import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  layoutContainer: ViewStyle;
  bodyArea: ViewStyle;
  footerArea: ViewStyle;
  rsBlock: ViewStyle;
  blockText: TextStyle;
  blockTitle: TextStyle;
  phraseBlock: ViewStyle;
  introWarning: ViewStyle;
  rsWarning: ViewStyle;
  copyArea: ViewStyle;
  resultContainer: ViewStyle;
  qrArea: ViewStyle;
  indicator: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    layoutContainer: {
      paddingHorizontal: theme.padding,
      flex: 1,
      marginTop: theme.margin,
    },
    bodyArea: {
      flex: 1,
      ...ScrollViewStyle,
    },
    footerArea: {
      flexDirection: 'row',
      paddingTop: theme.paddingLG,
      ...MarginBottomForSubmitButton,
    },
    rsBlock: {
      paddingTop: theme.paddingXS,
      paddingBottom: theme.paddingLG,
      paddingHorizontal: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    blockText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextBase,
      ...FontMedium,
      textAlign: 'center',
    },
    blockTitle: {
      ...FontSemiBold,
      color: theme.colorTextSecondary,
      marginBottom: theme.margin,
      textTransform: 'uppercase',
    },
    phraseBlock: {
      gap: theme.size,
    },
    introWarning: {
      marginBottom: theme.margin,
    },
    rsWarning: {
      marginBottom: theme.marginLG,
    },
    copyArea: {
      marginTop: theme.margin,
      alignItems: 'center',
    },
    qrArea: {
      alignItems: 'center',
      display: 'flex',
    },
    resultContainer: {
      display: 'flex',
      gap: theme.sizeLG,
    },
    indicator: {
      width: theme.sizeLG,
      height: theme.sizeLG,
    },
  });
};
