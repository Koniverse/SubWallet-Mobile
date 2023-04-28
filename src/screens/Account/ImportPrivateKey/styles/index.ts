import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  textArea: ViewStyle;
  footer: ViewStyle;
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
    textArea: {
      height: 6 * theme.sizeLG,
      paddingHorizontal: theme.paddingSM,
      paddingVertical: theme.paddingXS,
    },
    footer: {
      marginTop: theme.marginXS,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
  });
};
