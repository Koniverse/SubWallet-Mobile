import { ThemeTypes } from 'styles/themes';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (
  theme: ThemeTypes,
  isInputVisible: boolean,
  isValid: boolean,
  hasLabel: boolean,
  isReadonly?: boolean,
  showAvatar?: boolean,
  showAddressBook?: boolean,
  horizontal?: boolean,
) => {
  const addressText: StyleProp<TextStyle> = {
    ...FontSemiBold,
    paddingLeft: theme.paddingXS,
    color: isValid ? (isReadonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
    opacity: isInputVisible ? 0 : 1,
  };

  return StyleSheet.create({
    avatarWrapper: {
      marginLeft: theme.marginSM,
    },
    addressText: {
      ...addressText,
      flexShrink: 1,
      maxWidth: 120,
    },
    addressAliasText: {
      ...addressText,
      flexShrink: 1,
      color: isValid ? theme.colorTextLight4 : undefined,
    },
    scanButton: {
      marginRight: theme.marginXXS,
    },
    inputLeftPart: {
      right: 0,
      marginRight: (showAddressBook ? 40 : 0) + 40 + theme.paddingXXS,
    },
    input: {
      paddingLeft: showAvatar ? theme.sizeSM + (hasLabel ? 20 : 24) + theme.sizeXS : horizontal ? 8 : 12,
      opacity: isInputVisible ? 1 : 0,
      paddingRight: (showAddressBook ? 40 : 0) + 44,
    },
  });
};
