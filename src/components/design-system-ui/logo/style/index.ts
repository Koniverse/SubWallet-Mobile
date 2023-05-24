import { StyleSheet, ViewStyle } from 'react-native';

export interface LogoStyle {
  subLogoContainer: ViewStyle;
}

export default () =>
  StyleSheet.create<LogoStyle>({
    subLogoContainer: { position: 'absolute', bottom: -1, right: -1 },
  });
