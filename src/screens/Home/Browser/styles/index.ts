import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface BrowserStyle {
  searchInputStyle: ViewStyle;
  fakeSearchInputText: TextStyle;
  fakeSearchInput: ViewStyle;
}

export default () => {
  // const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<BrowserStyle>({
    fakeSearchInput: {
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      height: 48,
      position: 'relative',
      marginTop: 16,
      marginHorizontal: 16,
      padding: 10,
    },
    fakeSearchInputText: { marginLeft: 10, color: 'rgba(255, 255, 255, 0.45)', fontSize: 16 },
    searchInputStyle: { marginTop: 16, marginHorizontal: 16 },
  });
};
