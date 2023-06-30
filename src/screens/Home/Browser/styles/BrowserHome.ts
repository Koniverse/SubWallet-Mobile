import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ImageStyle as FastImageStyle } from 'react-native-fast-image';

export interface BrowserStyle {
  imageItem: FastImageStyle;
  squircleWrapper: ViewStyle;
  sectionActionTitle: TextStyle;
  sectionAction: ViewStyle;
  sectionTitle: TextStyle;
  sectionContainer: ViewStyle;
  container: ViewStyle;
  banner: FastImageStyle;
  absolute: ViewStyle;
}

export default () => {
  // const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<BrowserStyle>({
    container: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
    banner: { width: '100%', height: 120, borderRadius: 12, marginBottom: 6 },
    sectionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    sectionTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    sectionAction: { flexDirection: 'row', alignItems: 'center' },
    sectionActionTitle: {
      color: 'white',
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '600',
    },
    absolute: { position: 'absolute' },
    squircleWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    imageItem: { width: 55, height: 55 },
  });
};
