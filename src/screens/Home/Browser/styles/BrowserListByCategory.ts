import { StyleSheet, ViewStyle } from 'react-native';

export interface BrowserStyle {
  itemSeparator: ViewStyle;
  listItem: ViewStyle;
  container: ViewStyle;
}

export default () => {
  // const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<BrowserStyle>({
    container: { flex: 1 },
    listItem: { marginBottom: 16 },
    itemSeparator: { width: 10 },
  });
};
