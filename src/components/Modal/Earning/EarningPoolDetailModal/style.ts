import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  infoContainer: ViewStyle;
  headerText: TextStyle;
  faqContainer: ViewStyle;
  scrollButton: ViewStyle;
  faqText: TextStyle;
  lightText: TextStyle;
  highlightText: TextStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.size,
    },
    infoContainer: {
      gap: theme.sizeXS,
    },
    headerText: {
      ...FontSemiBold,
      textAlign: 'center',
      marginHorizontal: theme.paddingLG + theme.paddingXXS,
      color: theme.colorTextBase,
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
    },
    faqContainer: {
      position: 'relative',
    },
    scrollButton: {
      position: 'absolute',
      top: -(theme.sizeXXL + theme.sizeSM),
      right: 0,
    },
    faqText: {
      ...FontMedium,
      color: theme.colorTextSecondary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      textAlign: 'center',
      marginHorizontal: theme.marginLG,
    },
    lightText: {
      color: theme.colorText,
    },
    highlightText: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
  });
};
