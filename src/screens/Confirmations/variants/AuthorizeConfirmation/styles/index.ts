import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  text: TextStyle;
  textCenter: TextStyle;
  scroll: ViewStyle;
  contentContainer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      width: '100%',
    },
    textCenter: {
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      width: '100%',
      textAlign: 'center',
      paddingHorizontal: theme.padding,
    },
    scroll: {
      maxHeight: 180,
      width: '100%',
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeXS,
    },
  });
};
