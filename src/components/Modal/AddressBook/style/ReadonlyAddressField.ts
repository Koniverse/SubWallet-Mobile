import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    contentBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingHorizontal: theme.paddingSM,
    },
    avatarWrapper: {
      paddingRight: theme.paddingXS,
    },
    address: {
      flex: 1,
      color: theme.colorTextLight4,
      ...FontSemiBold,
    },
    copyButton: {
      marginRight: -theme.marginXS,
    },
  });
