import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMonoRegular, FontSemiBold } from 'styles/sharedStyles';

export interface TypographyStyle {
  monospace: TextStyle;
  defaultText: TextStyle;
  xsText: TextStyle;
  smText: TextStyle;
  mdText: TextStyle;
  lgText: TextStyle;
  title: TextStyle;
  titleLevel1: TextStyle;
  titleLevel2: TextStyle;
  titleLevel3: TextStyle;
  titleLevel4: TextStyle;
  titleLevel5: TextStyle;
  titleLevel6: TextStyle;
  titleSuperLevel1: TextStyle;
  titleSuperLevel2: TextStyle;
  titleSuperLevel3: TextStyle;
  underline: TextStyle;
  linkWrapper: ViewStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<TypographyStyle>({
    // Text styles
    monospace: { ...FontMonoRegular },
    defaultText: { fontSize: theme.fontSize, lineHeight: theme.lineHeight * theme.fontSize },
    xsText: { fontSize: theme.fontSizeXS, lineHeight: theme.lineHeightXS * theme.fontSizeXS },
    smText: { fontSize: theme.fontSizeSM, lineHeight: theme.lineHeightSM * theme.fontSizeSM },
    mdText: { fontSize: theme.fontSizeLG, lineHeight: theme.lineHeightLG * theme.fontSizeLG },
    // todo: current has no lineHeightXL, use lineHeightHeading4 for temporary solution
    lgText: { fontSize: theme.fontSizeXL, lineHeight: theme.lineHeightHeading4 * theme.fontSizeXL },
    // Title styles
    title: { ...FontSemiBold },
    titleLevel1: { fontSize: theme.fontSizeHeading1, lineHeight: theme.lineHeightHeading1 * theme.fontSizeHeading1 },
    titleLevel2: { fontSize: theme.fontSizeHeading2, lineHeight: theme.lineHeightHeading2 * theme.fontSizeHeading2 },
    titleLevel3: { fontSize: theme.fontSizeHeading3, lineHeight: theme.lineHeightHeading3 * theme.fontSizeHeading3 },
    titleLevel4: { fontSize: theme.fontSizeHeading4, lineHeight: theme.lineHeightHeading4 * theme.fontSizeHeading4 },
    titleLevel5: { fontSize: theme.fontSizeHeading5, lineHeight: theme.lineHeightHeading5 * theme.fontSizeHeading5 },
    titleLevel6: { fontSize: theme.fontSizeHeading6, lineHeight: theme.lineHeightHeading6 * theme.fontSizeHeading6 },
    titleSuperLevel1: { fontSize: theme.fontSizeSuper1, lineHeight: theme.lineHeightSuper1 * theme.fontSizeSuper1 },
    titleSuperLevel2: { fontSize: theme.fontSizeSuper2, lineHeight: theme.lineHeightSuper2 * theme.fontSizeSuper2 },
    titleSuperLevel3: { fontSize: theme.fontSizeSuper3, lineHeight: theme.lineHeightSuper3 * theme.fontSizeSuper3 },
    // Link styles
    underline: { textDecorationLine: 'underline' },
    linkWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
