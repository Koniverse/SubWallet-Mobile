import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export default (theme: ThemeTypes, hasLabel: boolean, isError: boolean, showAvatar?: boolean, readonly?: boolean) => {
  const baseInput = 48;

  const partBlock: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    height: baseInput,
  };

  return StyleSheet.create({
    container: {},
    label: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    textInput: {
      ...FontMedium,
      position: 'relative',
      paddingLeft: theme.paddingXXS,
      paddingRight: theme.paddingSM,
      fontSize: theme.fontSize,
      color: !isError ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      // lineHeight: Platform.OS === 'ios' ? 17 : theme.fontSize * theme.lineHeight, TODO: recheck this code in Android
      zIndex: 2,
      height: baseInput,
    },
    leftPart: {
      ...partBlock,
      left: 0,
    },
    rightPart: {
      ...partBlock,
      right: 0,
      zIndex: 2,
    },
  });
};
