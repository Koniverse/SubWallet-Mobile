import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface CreateMasterPasswordStyle {
  textStyle: TextStyle;
  footerAreaStyle: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CreateMasterPasswordStyle>({
    textStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      textAlign: 'center',
      ...FontMedium,
    },

    footerAreaStyle: {
      marginTop: theme.marginMD,
      // marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
  });
