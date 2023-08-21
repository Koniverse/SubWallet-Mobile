import { Dimensions, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalStyle {
  rootView: ViewStyle;
  container: ViewStyle;
  line: ViewStyle;
  headerButton: ViewStyle;
  headerContainer: ViewStyle;
  backDropButton: ViewStyle;
}

export default (theme: ThemeTypes, level: number) => {
  const containerZIndex = 99 + level * 2;
  const backDropZIndex = 98 + level * 2;
  return StyleSheet.create<ModalStyle>({
    rootView: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height: SCREEN_HEIGHT,
      zIndex: 9999,
    },
    container: {
      height: '100%',
      width: '100%',
      backgroundColor: theme.colorBgDefault,
      position: 'absolute',
      top: SCREEN_HEIGHT,
      zIndex: containerZIndex,
    },
    line: {
      width: 70,
      height: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignSelf: 'center',
      marginTop: theme.marginXS,
      borderRadius: 2,
    },
    headerButton: { width: 70 },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backDropButton: {
      flex: 1,
      backgroundColor: theme.colorBgSecondary,
      opacity: 0.8,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: backDropZIndex,
    },
  });
};
