import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  arrayValue: ViewStyle;
  label: TextStyle;
  node: ViewStyle;
  nodeLeaf: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    arrayValue: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeSM,
    },
    label: {
      fontFamily: theme.fontFamily,
    },
    node: {
      overflow: 'hidden',
      position: 'relative',
      marginLeft: theme.marginXS,
    },
    nodeLeaf: {
      marginTop: '0 !important',
      width: '100%',
      overflow: 'hidden',
      maxWidth: theme.controlHeightLG * 5,
      flex: 2,
    },
  });
};
