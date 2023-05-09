import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
export interface ButtonStyles {
  container: ViewStyle;
  blockButtonRaw: ViewStyle;
  centerContentAlign: ViewStyle;
  leftContentAlign: ViewStyle;
  primaryHighlight: ViewStyle;
  secondaryHighlight: ViewStyle;
  warningHighlight: ViewStyle;
  dangerHighlight: ViewStyle;
  ghostHighlight: ViewStyle;
  wrapperStyle: ViewStyle;
  xsRaw: ViewStyle;
  smRaw: ViewStyle;
  mdRaw: ViewStyle;
  lgRaw: ViewStyle;
  xlRaw: ViewStyle;
  xsIconOnly: ViewStyle;
  smIconOnly: ViewStyle;
  mdIconOnly: ViewStyle;
  lgIconOnly: ViewStyle;
  xlIconOnly: ViewStyle;
  defaultShapeRaw: ViewStyle;
  squareShapeRaw: ViewStyle;
  squircleShapeRaw: ViewStyle;
  roundShapeRaw: ViewStyle;
  circleShapeRaw: ViewStyle;
  ghostRaw: ViewStyle;
  primaryRaw: ViewStyle;
  secondaryRaw: ViewStyle;
  warningRaw: ViewStyle;
  dangerRaw: ViewStyle;
  primaryDisabledRaw: ViewStyle;
  secondaryDisabledRaw: ViewStyle;
  warningDisabledRaw: ViewStyle;
  dangerDisabledRaw: ViewStyle;
  ghostDisabledRaw: ViewStyle;
  textStyle: TextStyle;
  buttonRawText: TextStyle;
  primaryRawText: TextStyle;
  secondaryRawText: TextStyle;
  warningRawText: TextStyle;
  dangerRawText: TextStyle;
  ghostRawText: TextStyle;
  xsRawText: TextStyle;
  smRawText: TextStyle;
  mdRawText: TextStyle;
  lgRawText: TextStyle;
  xlRawText: TextStyle;
  primaryDisabledRawText: TextStyle;
  secondaryDisabledRawText: TextStyle;
  ghostDisabledRawText: TextStyle;
  warningDisabledRawText: TextStyle;
  dangerDisabledRawText: TextStyle;
  indicator: ViewStyle;
}
const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type ButtonSize = (typeof buttonSizes)[number];

const buttonSizeMap: Record<ButtonSize, number> = {
  xs: 40,
  sm: 48,
  md: 52,
  lg: 64,
  xl: 72,
};

export default (theme: ThemeTypes) =>
  StyleSheet.create<ButtonStyles>({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    blockButtonRaw: {
      flex: 1,
    },
    xsIconOnly: {
      paddingHorizontal: 0,
      minWidth: buttonSizeMap.xs,
    },
    smIconOnly: {
      paddingHorizontal: 0,
      minWidth: buttonSizeMap.sm,
    },
    mdIconOnly: {
      paddingHorizontal: 0,
      minWidth: buttonSizeMap.md,
    },
    lgIconOnly: {
      paddingHorizontal: 0,
      minWidth: buttonSizeMap.lg,
    },
    xlIconOnly: {
      paddingHorizontal: 0,
      minWidth: buttonSizeMap.xl,
    },
    centerContentAlign: {
      alignItems: 'center',
    },
    leftContentAlign: {
      alignItems: 'flex-start',
    },
    //highlight wrapper style follow type
    primaryHighlight: {
      backgroundColor: theme.colorPrimaryActive,
    },
    secondaryHighlight: {
      backgroundColor: theme['gray-1'],
    },
    warningHighlight: {
      backgroundColor: theme['yellow-4'],
    },
    dangerHighlight: {
      backgroundColor: theme['red-4'],
    },
    ghostHighlight: {
      backgroundColor: 'transparent',
    },
    // wrapper style follow size
    wrapperStyle: {
      justifyContent: 'center',
      paddingHorizontal: theme.paddingContentHorizontal - 4,
      paddingVertical: theme.paddingContentVerticalLG - 2,
    },
    xsRaw: {
      height: buttonSizeMap.xs,
    },
    smRaw: {
      height: buttonSizeMap.sm,
    },
    mdRaw: {
      height: buttonSizeMap.md,
    },
    lgRaw: {
      height: buttonSizeMap.lg,
    },
    xlRaw: {
      height: buttonSizeMap.xl,
    },
    //wrapper style follow shape
    defaultShapeRaw: {
      borderRadius: theme.borderRadiusLG,
    },
    squareShapeRaw: {
      borderRadius: 0,
    },
    squircleShapeRaw: {},
    roundShapeRaw: {
      borderRadius: buttonSizeMap.md,
    },
    circleShapeRaw: {
      borderRadius: buttonSizeMap.md,
    },
    ghostRaw: {
      backgroundColor: 'transparent',
    },
    //wrapper style follow type
    primaryRaw: {
      backgroundColor: theme.colorPrimary,
    },
    secondaryRaw: {
      backgroundColor: theme['gray-1'],
    },
    warningRaw: {
      backgroundColor: theme['yellow-6'],
    },
    dangerRaw: {
      backgroundColor: theme['red-6'],
    },
    //disabled wrapper style follow type
    primaryDisabledRaw: {
      backgroundColor: theme.colorPrimaryActive,
    },
    secondaryDisabledRaw: {
      backgroundColor: theme['gray-1'],
    },
    warningDisabledRaw: {
      backgroundColor: theme['yellow-4'],
    },
    dangerDisabledRaw: {
      backgroundColor: theme['red-4'],
    },
    ghostDisabledRaw: {
      backgroundColor: 'transparent',
    },
    buttonRawText: {
      paddingLeft: theme.paddingXS,
    },
    //text style follow type
    textStyle: {
      ...FontSemiBold,
    },
    primaryRawText: {
      color: theme.colorTextLight1,
    },
    secondaryRawText: {
      color: theme.colorTextLight1,
    },
    warningRawText: {
      color: theme.colorTextDark2,
    },
    dangerRawText: {
      color: theme.colorTextLight1,
    },
    ghostRawText: {
      color: theme['gray-4'],
    },
    //text style follow size
    xsRawText: {
      fontSize: theme.fontSize,
      lineHeight: buttonSizeMap.xs,
      height: buttonSizeMap.xs,
      fontWeight: '600',
    },
    smRawText: {
      fontSize: theme.fontSizeLG,
      lineHeight: buttonSizeMap.sm,
      height: buttonSizeMap.sm,
      fontWeight: '600',
    },
    mdRawText: {
      fontSize: theme.fontSizeLG,
      lineHeight: buttonSizeMap.md,
      height: buttonSizeMap.md,
      fontWeight: '600',
    },
    lgRawText: {
      fontSize: theme.fontSizeLG,
      lineHeight: buttonSizeMap.lg,
      height: buttonSizeMap.lg,
      fontWeight: '600',
    },
    xlRawText: {
      fontSize: theme.fontSizeLG,
      lineHeight: buttonSizeMap.lg,
      height: buttonSizeMap.lg,
      fontWeight: '600',
    },
    //disabled text style follow type
    primaryDisabledRawText: {
      color: theme.colorTextLight5,
    },
    secondaryDisabledRawText: {
      color: theme.colorTextLight5,
    },
    ghostDisabledRawText: {
      color: theme['gray-4'],
    },
    warningDisabledRawText: {
      color: theme.colorTextDark5,
    },
    dangerDisabledRawText: {
      color: theme.colorTextLight5,
    },
    //indicator style
    indicator: {
      marginRight: theme.marginXS,
    },
  });
