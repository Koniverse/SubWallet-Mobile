import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { deviceHeight } from 'constants/index';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  error: ViewStyle;
  passwordContainer: ViewStyle;
  passwordField: ViewStyle;
  accountPreview: ViewStyle;
  accountList: ViewStyle;
  accountItem: ViewStyle;
  footer: ViewStyle;
  sectionHeaderContainer: ViewStyle;
  sectionHeaderTitle: ViewStyle;
}

const createStyles = (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      flex: 1,
    },
    container: {
      flex: 1,
      ...ScrollViewStyle,
    },
    title: {
      color: theme.colorTextDescription,
      paddingHorizontal: theme.padding,
      marginBottom: theme.margin,
      textAlign: 'center',
      fontWeight: theme.bodyFontWeight,
      width: '100%',
      ...FontMedium,
    },
    description: {
      color: theme.colorTextDescription,
      fontWeight: theme.bodyFontWeight,
      ...FontMedium,
    },
    error: {
      marginTop: theme.marginXS,
    },
    accountPreview: {
      marginTop: theme.marginXS,
      marginBottom: theme.marginXS,
    },
    accountList: {
      width: '100%',
      minHeight: 2,
      maxHeight: deviceHeight * 0.5,
    },
    accountItem: {
      paddingTop: theme.paddingSM,
      paddingBottom: theme.paddingSM,
      marginBottom: theme.marginXS,
    },
    passwordContainer: {
      marginTop: theme.margin,
    },
    passwordField: {
      paddingTop: theme.paddingSM,
      paddingBottom: theme.paddingXXS - 1,
    },
    footer: {
      marginTop: theme.margin,
      ...MarginBottomForSubmitButton,
    },
    sectionHeaderContainer: {
      paddingBottom: theme.sizeXS,
      backgroundColor: theme.colorBgDefault,
      paddingHorizontal: theme.padding,
    },
    sectionHeaderTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      textTransform: 'uppercase',
    },
  });
};

export default createStyles;
