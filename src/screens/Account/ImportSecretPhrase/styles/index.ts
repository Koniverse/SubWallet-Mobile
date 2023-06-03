import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
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
      ...sharedStyles.layoutContainer,
    },
    container: {
      flex: 1,
      ...ScrollViewStyle,
    },
    title: {
      color: theme.colorTextDescription,
      paddingHorizontal: theme.padding,
      marginVertical: theme.margin,
      textAlign: 'center',
      fontWeight: theme.bodyFontWeight,
      ...FontMedium,
    },
    textArea: {
      height: 4 * theme.sizeLG,
      paddingHorizontal: theme.paddingSM,
      paddingVertical: theme.paddingXS,
      marginBottom: theme.margin,
    },
    footer: {
      marginTop: theme.margin,
      ...MarginBottomForSubmitButton,
    },
  });
};
