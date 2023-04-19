import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  container: ViewStyle;
  linkIcon: ViewStyle;
}

export default (theme: ThemeTypes, linkIconBg?: string) => {
  return StyleSheet.create<ComponentStyle>({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginHorizontal: 'auto',
      padding: theme.paddingXS,
      marginTop: 0,
    },
    linkIcon: {
      backgroundColor: linkIconBg || theme['gray-1'],
      zIndex: 10,
      textAlign: 'center',
      height: theme.controlHeightLG,
      width: theme.controlHeightLG,
      borderRadius: theme.controlHeightLG / 2,
      padding: (40 - 24) / 2,
      marginHorizontal: -theme.marginSM,
      marginVertical: 0,
    },
  });
};
