import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (
  theme: ThemeTypes,
  isInputVisible: boolean,
  isValid: boolean,
  hasLabel: boolean,
  isReadonly?: boolean,
  showAvatar?: boolean,
  showAddressBook?: boolean,
) =>
  StyleSheet.create({
    avatarWrapper: {
      marginLeft: theme.marginSM,
    },
    addressText: {
      ...FontSemiBold,
      paddingRight: theme.paddingXS,
      paddingLeft: showAvatar ? theme.paddingXS : 0,
      color: isValid ? (isReadonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      opacity: isInputVisible ? 0 : 1,
    },
    scanButton: {
      marginRight: theme.marginXXS,
    },
    inputStyle: {
      paddingLeft: showAvatar ? theme.sizeSM + (hasLabel ? 20 : 24) + theme.sizeXS : undefined,
      opacity: isInputVisible ? 1 : 0,
      paddingRight: (showAddressBook ? 40 : 0) + 44,
    },
  });
