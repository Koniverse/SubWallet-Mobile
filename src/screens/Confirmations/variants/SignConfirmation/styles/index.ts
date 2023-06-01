import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  title: TextStyle;
  description: TextStyle;
  detailContainer: ViewStyle;
  detailName: TextStyle;
  detailValue: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    title: {
      color: theme.colorTextBase,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
      ...FontSemiBold,
    },
    description: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      width: '100%',
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      ...FontMedium,
    },
    detailContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.size,
    },
    detailName: {
      flex: 1,
      textAlign: 'right',
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      ...FontMedium,
    },
    detailValue: {
      flex: 1,
      textAlign: 'left',
      color: theme.colorText,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      ...FontMedium,
    },
  });
};
