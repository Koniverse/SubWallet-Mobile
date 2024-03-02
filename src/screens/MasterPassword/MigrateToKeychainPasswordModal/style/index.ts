import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface CreateMasterPasswordStyle {
  modalWrapper: ViewStyle;
  textStyle: TextStyle;
  footerAreaStyle: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CreateMasterPasswordStyle>({
    modalWrapper: { width: '100%', alignItems: 'center', paddingTop: 10 },
    textStyle: {
      marginTop: 15,
      paddingHorizontal: theme.paddingContentHorizontal,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight4,
      textAlign: 'center',
      ...FontMedium,
    },

    footerAreaStyle: {
      marginTop: theme.margin,
      width: '100%',
      ...MarginBottomForSubmitButton,
    },
  });
