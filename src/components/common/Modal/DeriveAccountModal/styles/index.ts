import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  accountItem: ViewStyle;
  accountDisable: ViewStyle;
  modal: ViewStyle;
  wrapper: ViewStyle;
  container: ViewStyle;
  search: ViewStyle;
  list: ViewStyle;
}

const createStyles = (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    accountItem: {
      width: '100%',
    },
    accountDisable: {
      opacity: theme.opacityDisable,
    },
    modal: {
      marginTop: 125,
    },
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
    },
    container: {
      width: '100%',
    },
    search: {
      marginBottom: theme.marginXS,
      marginTop: -(30 - theme.margin),
    },
    list: {
      gap: theme.sizeXS,
    },
  });
};

export default createStyles;
