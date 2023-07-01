import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { FontSemiBold } from 'styles/sharedStyles';

export interface BrowserStyle {
  title: TextStyle;
  image: FastImageStyle;
  imageWrapper: FastImageStyle;
  squircleWrapper: ViewStyle;
  absolute: ViewStyle;
}

export default () => {
  // const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<BrowserStyle>({
    absolute: { position: 'absolute' },
    squircleWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    imageWrapper: { alignItems: 'center' },
    image: { width: 44, height: 44 },
    title: { width: 40, color: 'white', fontSize: 10, ...FontSemiBold, marginTop: 8 },
  });
};
