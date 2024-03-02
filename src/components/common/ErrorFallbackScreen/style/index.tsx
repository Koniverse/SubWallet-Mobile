import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ImageStyle } from 'react-native-fast-image';
import { ThemeTypes } from 'styles/themes';
export interface ButtonStyles {
  buttonSubmit: ViewStyle;
  container: ViewStyle;
  gradientContainer: ViewStyle;
  content: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  textContent: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ButtonStyles>({
    container: { height: '100%', paddingBottom: theme.paddingXL, paddingHorizontal: theme.padding },
    gradientContainer: { flex: 1, backgroundColor: 'black' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logo: { width: 112, height: 112, marginBottom: 32 },
    title: { marginBottom: theme.margin, color: '#BF1616', fontWeight: `${theme.fontWeightStrong}` },
    textContent: { fontSize: 14, paddingHorizontal: 15, textAlign: 'center', color: 'rgba(255, 255, 255, 0.45)' },
    buttonSubmit: { marginTop: 12 },
  });
