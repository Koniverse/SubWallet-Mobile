import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface LoginStyle {
  container: ViewStyle;
  subLogo: ViewStyle;
  subTitle: ViewStyle;
  submitButton: ViewStyle;
  forgotpasswordText: TextStyle;
  forgotpasswordButton: ViewStyle;
  fullscreen: ViewStyle;
  fullWidth: ViewStyle;
}

export default () => {
  const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<LoginStyle>({
    container: { width: '100%', alignItems: 'center', paddingTop: 93 },
    subLogo: { paddingTop: 20, paddingBottom: 12 },
    subTitle: { marginBottom: 40, color: theme.colorTextLabel },
    submitButton: { width: '100%', marginTop: 8 },
    fullscreen: { width: '100%', height: '100%' },
    fullWidth: { width: '100%' },
    forgotpasswordText: { color: theme.colorTextDescription },
    forgotpasswordButton: { alignSelf: 'flex-end', height: 35, justifyContent: 'center' },
  });
};
