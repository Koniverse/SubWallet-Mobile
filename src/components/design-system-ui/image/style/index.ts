import { StyleSheet, ViewStyle } from 'react-native';
import { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { ThemeTypes } from 'styles/themes';

export interface ImageStyle {
  container: ViewStyle;
  defaultImage: FastImageStyle;
  squareImage: FastImageStyle;
  circleImage: FastImageStyle;
  squircleImage: FastImageStyle;
  backgroundColor: FastImageStyle;
  loadingImage: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ImageStyle>({
    container: {},
    defaultImage: {
      borderTopLeftRadius: theme.borderRadiusLG,
      borderTopRightRadius: theme.borderRadiusLG,
      borderBottomRightRadius: theme.borderRadiusLG,
      borderBottomLeftRadius: theme.borderRadiusLG,
    },
    squareImage: {
      borderRadius: 0,
      position: 'absolute',
    },
    circleImage: {
      borderTopLeftRadius: 999,
      borderTopRightRadius: 999,
      borderBottomRightRadius: 999,
      borderBottomLeftRadius: 999,
    },
    squircleImage: {
      borderRadius: 0,
    },
    loadingImage: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backgroundColor: {
      backgroundColor: 'transparent',
    },
  });
