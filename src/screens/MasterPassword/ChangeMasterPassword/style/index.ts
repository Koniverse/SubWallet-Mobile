import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface ChangeMasterPasswordStyle {
  bodyWrapper: ViewStyle;
  footerAreaStyle: ViewStyle;
  error: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ChangeMasterPasswordStyle>({
    bodyWrapper: { paddingHorizontal: theme.padding, flex: 1 },
    footerAreaStyle: {
      marginTop: theme.marginXS,
      marginHorizontal: theme.margin,
      ...MarginBottomForSubmitButton,
    },
    error: {
      marginBottom: theme.marginXS,
    },
  });
