import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface CreateMasterPasswordStyle {
  bodyWrapper: ViewStyle;
  instructionTextStyle: TextStyle;
  footerAreaStyle: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CreateMasterPasswordStyle>({
    bodyWrapper: { paddingHorizontal: theme.padding, flex: 1 },
    instructionTextStyle: {
      color: theme.colorTextLight4,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontSemiBold,
      textAlign: 'center',
      paddingTop: theme.padding,
      paddingBottom: theme.paddingLG,
    },
    footerAreaStyle: {
      marginTop: theme.margin,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
  });
