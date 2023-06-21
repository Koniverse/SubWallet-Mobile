import { ThemeTypes } from 'styles/themes';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  const generalFieldBaseComponentStyle: StyleProp<ViewStyle> = {
    marginBottom: 0,
  };

  return StyleSheet.create({
    generalFieldBaseComponentStyle,
    scrollView: { ...ContainerHorizontalPadding, marginTop: theme.margin },
    scrollViewContentContainer: { gap: theme.sizeSM },
    footer: {
      ...ContainerHorizontalPadding,
      ...MarginBottomForSubmitButton,
      paddingTop: theme.padding,
      flexDirection: 'row',
      gap: theme.sizeSM,
    },
    footerButton: {
      flex: 1,
    },
    row: { flexDirection: 'row', gap: theme.sizeSM },
    flex1: { flex: 1 },
    enableNetworkButton: {
      marginTop: theme.marginXS,
    },
    generalFormErrorMessage: {
      marginTop: theme.marginXS,
    },
  });
};
