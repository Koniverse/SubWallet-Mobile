import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export interface AvatarStyle {
  container: ViewStyle;
  textStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<AvatarStyle>({
    container: {
      backgroundColor: theme.colorError,
      paddingHorizontal: theme.paddingXS,
      height: 20,
      borderRadius: theme.borderRadiusLG + 2,
    },

    textStyle: { color: theme.colorWhite, ...FontMedium },
  });
