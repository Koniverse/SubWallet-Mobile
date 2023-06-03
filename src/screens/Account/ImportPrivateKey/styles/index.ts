import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';
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
      paddingTop: theme.padding,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.padding,
    },
    title: {
      color: theme.colorTextDescription,
      paddingHorizontal: theme.padding,
      marginBottom: theme.margin,
      textAlign: 'center',
      fontWeight: theme.bodyFontWeight,
      ...FontMedium,
    },
    textArea: {
      height: 6 * theme.sizeLG,
      paddingHorizontal: theme.paddingSM,
      paddingVertical: theme.paddingXS,
    },
    footer: {
      marginTop: theme.margin,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
  });
};
