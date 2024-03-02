import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  inputContainer: ViewStyle;
  textInput: TextStyle;
  leftInputStyle: ViewStyle;
  rightInputStyle: ViewStyle;
  warningStyle: ViewStyle;
}

function createStyles(theme: ThemeTypes, readonly?: boolean, isFocus?: boolean) {
  return StyleSheet.create<ComponentStyle>({
    inputContainer: {
      width: '100%',
      position: 'relative',
      marginBottom: 8,
      height: 48,
      paddingLeft: 44,
      paddingRight: 52,
      borderWidth: 2,
      borderColor: isFocus ? theme.colorPrimary : theme.colorBgSecondary,
    },
    textInput: {
      paddingTop: 13,
      paddingHorizontal: 0,
      backgroundColor: theme.colorBgSecondary,
      height: 44,
    },
    leftInputStyle: { left: 15, zIndex: 2 },
    rightInputStyle: { right: 3, zIndex: 2 },
    warningStyle: { marginTop: 8 },
  });
}

export default createStyles;
