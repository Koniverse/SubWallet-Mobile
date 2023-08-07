import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface AccountInfoFieldStyle {
  container: ViewStyle;
  accountInfoFieldLeftPart: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<AccountInfoFieldStyle>({
    container: {
      flexDirection: 'row',
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: theme.colorBgInput,
      borderRadius: 8,
      alignItems: 'center',
    },
    accountInfoFieldLeftPart: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  });
