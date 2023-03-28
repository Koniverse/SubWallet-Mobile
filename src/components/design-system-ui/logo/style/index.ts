import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface LogoStyle {
  subLogoContainer: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<LogoStyle>({
    subLogoContainer: { position: 'absolute', bottom: -1, right: -1 },
  });
