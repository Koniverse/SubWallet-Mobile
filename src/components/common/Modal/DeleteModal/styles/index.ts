import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ModalStyle {
  container: ViewStyle;
  footerModalStyle: ViewStyle;
  deleteModalConfirmationStyle: TextStyle;
  deleteModalMessageTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ModalStyle>({
    container: { width: '100%' },
    footerModalStyle: {
      width: '100%',
      paddingTop: theme.paddingXS,
    },
    deleteModalConfirmationStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorError,
      ...FontSemiBold,
      textAlign: 'center',
      paddingBottom: theme.paddingMD,
    },
    deleteModalMessageTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextTertiary,
      ...FontMedium,
      textAlign: 'center',
      paddingHorizontal: theme.padding,
    },
  });
