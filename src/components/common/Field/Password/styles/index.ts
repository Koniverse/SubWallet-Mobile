import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export interface ComponentStyle {
  inputContainer: ViewStyle;
  textInput: TextStyle;
  leftInputStyle: ViewStyle;
  rightInputStyle: ViewStyle;
  warningStyle: ViewStyle;
}

function createStyles(theme: ThemeTypes, isValid: boolean, readonly?: boolean, isFocus?: boolean) {
  return StyleSheet.create<ComponentStyle>({
    inputContainer: {
      width: '100%',
      position: 'relative',
      marginBottom: 8,
      height: 48,
    },
    textInput: {
      ...FontMedium,
      paddingLeft: 44,
      paddingRight: 52,
      paddingTop: 13,
      paddingBottom: 13,
      borderColor: isFocus ? theme.colorPrimary : theme.colorBgSecondary,
      borderWidth: 2,
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      lineHeight: Platform.OS === 'ios' ? 17 : theme.lineHeight * theme.fontSize,
      fontSize: theme.fontSize,
      zIndex: 1,
    },
    leftInputStyle: { left: 15, zIndex: 2 },
    rightInputStyle: { right: 3, zIndex: 2 },
    warningStyle: { marginTop: 8 },
  });
}

export default createStyles;
