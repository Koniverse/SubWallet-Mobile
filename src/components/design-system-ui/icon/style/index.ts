import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';

export interface IconStyle {
  monospace: TextStyle;
  xsText: TextStyle;
  smText: TextStyle;
  mdText: TextStyle;
  lgText: TextStyle;
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
  StyleSheet.create<IconStyle>({
    // Text styles
    monospace: {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    xsText: { fontSize: theme.fontSizeXS },
    smText: { fontSize: theme.fontSizeSM },
    mdText: { fontSize: theme.fontSizeLG },
    lgText: { fontSize: theme.fontSizeXL },
    // Title styles
    titleLevel1: { fontSize: theme.fontSizeHeading1 },
    titleLevel2: { fontSize: theme.fontSizeHeading2 },
    titleLevel3: { fontSize: theme.fontSizeHeading3 },
    titleLevel4: { fontSize: theme.fontSizeHeading4 },
    titleLevel5: { fontSize: theme.fontSizeHeading5 },
    titleLevel6: { fontSize: theme.fontSizeHeading6 },
    titleSuperLevel1: { fontSize: theme.fontSizeSuper1 },
    titleSuperLevel2: { fontSize: theme.fontSizeSuper2 },
    titleSuperLevel3: { fontSize: theme.fontSizeSuper3 },
    // Link styles
    underline: { textDecorationLine: 'underline' },
    linkWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
