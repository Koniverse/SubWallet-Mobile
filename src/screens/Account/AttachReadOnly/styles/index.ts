import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  pageIconContainer: ViewStyle;
  footer: ViewStyle;
  warning: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      flex: 1,
    },
    container: {
      ...sharedStyles.layoutContainer,
    },
    title: {
      color: theme.colorTextDescription,
      paddingHorizontal: theme.padding,
      marginVertical: theme.margin,
      textAlign: 'center',
      fontWeight: theme.bodyFontWeight,
    },
    pageIconContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.controlHeightLG,
      marginBottom: theme.controlHeightLG + theme.margin,
    },
    footer: {
      marginTop: theme.marginXS,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
    warning: {
      marginBottom: theme.marginXS,
    },
  });
};
