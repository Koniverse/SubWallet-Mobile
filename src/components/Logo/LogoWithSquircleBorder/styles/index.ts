import { StyleSheet, ViewStyle } from 'react-native';

export interface ComponentStyle {
  container: ViewStyle;
  inner: ViewStyle;
}

export default (size = 120, innerSize = 56) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      width: size,
      height: size,
      padding: ((size || 0) - (innerSize || 0)) / 2,
      overflow: 'hidden',
      position: 'relative',
    },
    inner: {
      position: 'relative',
      width: innerSize,
      height: innerSize,
    },
  });
};
