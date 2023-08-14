import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ModalStyle {
  container: ViewStyle;
  footerModalStyle: ViewStyle;
  deleteModalConfirmationStyle: TextStyle;
  confirmModalMessageTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ModalStyle>({
    container: { width: '100%' },
    footerModalStyle: {
      width: '100%',
      flexDirection: 'row',
      marginTop: theme.margin,
    },
    deleteModalConfirmationStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorWarning,
      ...FontSemiBold,
      textAlign: 'center',
      paddingBottom: theme.paddingMD,
    },
    confirmModalMessageTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextTertiary,
      ...FontMedium,
      textAlign: 'center',
      paddingHorizontal: theme.padding,
    },
  });
