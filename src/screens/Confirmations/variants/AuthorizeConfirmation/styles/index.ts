import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  text: TextStyle;
  textCenter: TextStyle;
  scroll: ViewStyle;
  contentContainer: ViewStyle;
  noAccountTextStyle: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      width: '100%',
      ...FontMedium,
    },
    textCenter: {
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      width: '100%',
      textAlign: 'center',
      paddingHorizontal: theme.padding,
      ...FontMedium,
    },
    noAccountTextStyle: {
      color: theme.colorWhite,
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
      width: '100%',
      textAlign: 'center',
      ...FontSemiBold,
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
