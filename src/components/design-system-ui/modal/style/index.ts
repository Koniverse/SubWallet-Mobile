import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ModalStyle {
  container: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<ModalStyle>({
    container: {},
  });
