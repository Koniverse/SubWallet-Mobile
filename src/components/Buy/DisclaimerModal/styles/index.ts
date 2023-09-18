import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';

export interface LoginStyle {
  contentWrapper: ViewStyle;
  content: TextStyle;
  buttonWrapper: ViewStyle;
}

export default () => {
  const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<LoginStyle>({
    contentWrapper: { width: '100%', alignItems: 'center', paddingTop: theme.padding },
    content: {
      ...FontMedium,
      color: theme.colorTextLight3,
      textAlign: 'center',
      marginBottom: theme.margin,
    },
    buttonWrapper: { flexDirection: 'row', width: '100%', gap: theme.paddingSM, paddingTop: theme.paddingSM },
  });
};
