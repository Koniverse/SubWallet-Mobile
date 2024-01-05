import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  loadingStepContainer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    loadingStepContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: theme.sizeXL,
    },
  });
};
