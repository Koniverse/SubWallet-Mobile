import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { convertHexColorToRGBA } from 'utils/color';
import { FontBold } from 'styles/sharedStyles';

export interface TagStyle {
  tag: ViewStyle;
  wrap: ViewStyle;
  shapeDefaultStyle: ViewStyle;
  shapeSquareStyle: ViewStyle;
  shapeRoundStyle: ViewStyle;
  //primary
  primaryDefaultWrap: ViewStyle;
  primaryGrayWrap: ViewStyle;
  primaryFilledWrap: ViewStyle;
  primaryDefaultText: TextStyle;
  primaryGrayText: TextStyle;
  primaryFilledText: TextStyle;
  //secondary
  secondaryDefaultWrap: ViewStyle;
  secondaryGrayWrap: ViewStyle;
  secondaryFilledWrap: ViewStyle;
  secondaryDefaultText: TextStyle;
  secondaryGrayText: TextStyle;
  secondaryFilledText: TextStyle;
  //success
  successDefaultWrap: ViewStyle;
  successGrayWrap: ViewStyle;
  successFilledWrap: ViewStyle;
  successDefaultText: TextStyle;
  successGrayText: TextStyle;
  successFilledText: TextStyle;
  //processing
  processingDefaultWrap: ViewStyle;
  processingGrayWrap: ViewStyle;
  processingFilledWrap: ViewStyle;
  processingDefaultText: TextStyle;
  processingGrayText: TextStyle;
  processingFilledText: TextStyle;
  //error
  errorDefaultWrap: ViewStyle;
  errorGrayWrap: ViewStyle;
  errorFilledWrap: ViewStyle;
  errorDefaultText: TextStyle;
  errorGrayText: TextStyle;
  errorFilledText: TextStyle;
  //warning
  warningDefaultWrap: ViewStyle;
  warningGrayWrap: ViewStyle;
  warningFilledWrap: ViewStyle;
  warningDefaultText: TextStyle;
  warningGrayText: TextStyle;
  warningFilledText: TextStyle;
  text: TextStyle;
  close: ViewStyle;
}

type StatusVariableType = 'Success' | 'Info' | 'Error' | 'Warning' | 'Primary' | 'Secondary';

export default (theme: ThemeTypes) => {
  const getTagStatusWrapStyle = (bgType: 'default' | 'gray' | 'filled', colorVariable: StatusVariableType) => {
    const tagBackgroundColor =
      bgType === 'default'
        ? convertHexColorToRGBA(theme[`color${colorVariable}`], 0.1)
        : bgType === 'filled'
        ? theme[`color${colorVariable}`]
        : theme['gray-1'];
    return {
      backgroundColor: tagBackgroundColor,
    };
  };
  const getTagStatusTextStyle = (bgType: 'default' | 'gray' | 'filled', colorVariable: StatusVariableType) => {
    const tagColorText = bgType === 'default' || bgType === 'gray' ? theme[`color${colorVariable}`] : theme.colorText;
    return {
      color: tagColorText,
    };
  };

  const tagHeight = Math.round(theme.fontSizeXS * theme.lineHeightXS);

  return StyleSheet.create<TagStyle>({
    tag: {
      position: 'relative',
      overflow: 'visible',
    },
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.paddingXXS / 2,
      paddingHorizontal: theme.paddingXS,
    },
    shapeDefaultStyle: {
      borderRadius: theme.borderRadiusLG,
    },
    shapeSquareStyle: {
      borderRadius: 0,
    },
    shapeRoundStyle: {
      borderRadius: tagHeight,
    },
    //bgType with status
    primaryDefaultWrap: getTagStatusWrapStyle('default', 'Primary'),
    primaryGrayWrap: getTagStatusWrapStyle('gray', 'Primary'),
    primaryFilledWrap: getTagStatusWrapStyle('filled', 'Primary'),
    secondaryDefaultWrap: getTagStatusWrapStyle('default', 'Secondary'),
    secondaryGrayWrap: getTagStatusWrapStyle('gray', 'Secondary'),
    secondaryFilledWrap: getTagStatusWrapStyle('filled', 'Secondary'),
    successDefaultWrap: getTagStatusWrapStyle('default', 'Success'),
    successGrayWrap: getTagStatusWrapStyle('gray', 'Success'),
    successFilledWrap: getTagStatusWrapStyle('filled', 'Success'),
    processingDefaultWrap: getTagStatusWrapStyle('default', 'Info'),
    processingGrayWrap: getTagStatusWrapStyle('gray', 'Info'),
    processingFilledWrap: getTagStatusWrapStyle('filled', 'Info'),
    errorDefaultWrap: getTagStatusWrapStyle('default', 'Error'),
    errorGrayWrap: getTagStatusWrapStyle('gray', 'Error'),
    errorFilledWrap: getTagStatusWrapStyle('filled', 'Error'),
    warningDefaultWrap: getTagStatusWrapStyle('default', 'Warning'),
    warningGrayWrap: getTagStatusWrapStyle('gray', 'Warning'),
    warningFilledWrap: getTagStatusWrapStyle('filled', 'Warning'),
    text: {
      fontSize: theme.fontSizeXS,
      textAlign: 'center',
      lineHeight: tagHeight,
      ...FontBold,
    },
    primaryDefaultText: getTagStatusTextStyle('default', 'Primary'),
    primaryGrayText: getTagStatusTextStyle('gray', 'Primary'),
    primaryFilledText: getTagStatusTextStyle('filled', 'Primary'),
    secondaryDefaultText: getTagStatusTextStyle('default', 'Secondary'),
    secondaryGrayText: getTagStatusTextStyle('gray', 'Secondary'),
    secondaryFilledText: getTagStatusTextStyle('filled', 'Secondary'),
    successDefaultText: getTagStatusTextStyle('default', 'Success'),
    successGrayText: getTagStatusTextStyle('gray', 'Success'),
    successFilledText: getTagStatusTextStyle('filled', 'Success'),
    processingDefaultText: getTagStatusTextStyle('default', 'Info'),
    processingGrayText: getTagStatusTextStyle('gray', 'Info'),
    processingFilledText: getTagStatusTextStyle('filled', 'Info'),
    errorDefaultText: getTagStatusTextStyle('default', 'Error'),
    errorGrayText: getTagStatusTextStyle('gray', 'Error'),
    errorFilledText: getTagStatusTextStyle('filled', 'Error'),
    warningDefaultText: getTagStatusTextStyle('default', 'Warning'),
    warningGrayText: getTagStatusTextStyle('gray', 'Warning'),
    warningFilledText: getTagStatusTextStyle('filled', 'Warning'),
    close: {
      marginLeft: 4,
    },
  });
};
