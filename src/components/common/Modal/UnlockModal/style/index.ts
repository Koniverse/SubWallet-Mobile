import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  footer: ViewStyle;
  wrapper: ViewStyle;
  separator: ViewStyle;
  header: TextStyle;
  container: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      width: '100%',
      backgroundColor: theme.colorBgDefault,
      borderTopLeftRadius: theme.borderRadiusXXL,
      borderTopRightRadius: theme.borderRadiusXXL,
      alignItems: 'center',
    },
    footer: {
      width: '100%',
      marginBottom: theme.margin,
      marginTop: theme.marginXS,
    },
    wrapper: {
      width: '100%',
      paddingHorizontal: theme.padding,
    },
    separator: {
      width: 70,
      height: 5,
      borderRadius: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginBottom: 16,
      marginTop: theme.marginXS,
    },
    header: {
      color: theme.colorWhite,
      ...FontSemiBold,
      textAlign: 'center',
      marginBottom: theme.margin,
    },
  });
};
