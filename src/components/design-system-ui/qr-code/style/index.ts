import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface QRCodeStyle {
  container: ViewStyle;
  expired: ViewStyle;
  bold: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<QRCodeStyle>({
    container: {
      borderRadius: theme.borderRadius,
      backgroundColor: 'white',
      padding: theme.paddingXS,
    },
    expired: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      position: 'absolute',
      borderRadius: theme.borderRadius,
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    },
    bold: { fontWeight: '500' },
  });
