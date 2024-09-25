import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
export interface CheckBoxStyles {
  wrapper: ViewStyle;
  container: ViewStyle;
  containerHasTitle: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<CheckBoxStyles>({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    container: {
      margin: 5,
      marginLeft: theme.marginSM - 2,
      marginRight: theme.marginSM - 2,
      padding: 10,
    },
    containerHasTitle: {
      borderWidth: 1,
      borderRadius: 3,
      backgroundColor: '#fafafa',
      borderColor: '#ededed',
    },
  });
