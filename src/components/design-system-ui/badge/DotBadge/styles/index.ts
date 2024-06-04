import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface AvatarStyle {
  dot: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<AvatarStyle>({
    dot: {
      backgroundColor: theme.colorError,
      height: 6,
      width: 6,
      borderRadius: theme.borderRadiusLG,
      position: 'absolute',
      right: -3,
      top: -3,
    },
  });
