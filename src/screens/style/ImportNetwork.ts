import { ThemeTypes } from 'styles/themes';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  const inputWithLeftIcon: StyleProp<TextStyle> = {
    paddingLeft: theme.paddingXXS + 40,
  };

  return StyleSheet.create({
    inputWithLeftIcon,
    scrollView: { ...ContainerHorizontalPadding, marginTop: theme.margin },
    scrollViewContentContainer: { gap: theme.sizeSM },
    row: { flexDirection: 'row', gap: theme.sizeSM },
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    footer: { ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: theme.padding },
  });
};
