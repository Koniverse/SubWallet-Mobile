import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ImageStyle } from 'react-native-fast-image';
import { ThemeTypes } from 'styles/themes';
export interface ButtonStyles {
  container: ViewStyle;
  gradientContainer: ViewStyle;
  content: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  textContent: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ButtonStyles>({
    container: { flex: 1, backgroundColor: 'black' },
    gradientContainer: { flex: 1, paddingBottom: theme.paddingXL, paddingHorizontal: theme.padding },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logo: { width: 112, height: 112, marginBottom: 32 },
    title: { marginBottom: theme.margin, color: '#BF1616', fontWeight: `${theme.fontWeightStrong}` },
    textContent: { paddingHorizontal: 40, textAlign: 'center', color: 'rgba(255, 255, 255, 0.65)' },
  });
