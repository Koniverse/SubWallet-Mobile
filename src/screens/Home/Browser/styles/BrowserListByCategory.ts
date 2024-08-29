import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface BrowserStyle {
  listItem: ViewStyle;
  container: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<BrowserStyle>({
    container: { flex: 1, padding: theme.padding, paddingTop: theme.paddingSM },
    listItem: { marginBottom: theme.margin },
  });
};
