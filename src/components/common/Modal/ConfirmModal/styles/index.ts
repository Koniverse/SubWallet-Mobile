import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ModalStyle {
  container: ViewStyle;
  contentStyle: ViewStyle;
  iconWrapperStyle: ViewStyle;
  footerModalStyle: ViewStyle;
  deleteModalConfirmationStyle: TextStyle;
  confirmModalMessageTextStyle: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ModalStyle>({
    container: { width: '100%' },
    // The extension gives the alert body a full padding under the header (.__modal-content
    // paddingTop: token.padding, on top of the header's own); measured against it, the old 10
    // here left the page icon roughly 16dp too close to the title.
    contentStyle: {
      width: '100%',
      alignItems: 'center',
      paddingTop: theme.paddingLG,
    },
    // Matches the extension's .__alert-icon marginBottom: 20.
    iconWrapperStyle: {
      paddingBottom: 20,
    },
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
