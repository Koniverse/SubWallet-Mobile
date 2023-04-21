import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    item: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      minHeight: 68,
      flexDirection: 'row',
      paddingLeft: theme.sizeSM,
      paddingRight: theme.sizeXXS,
      overflow: 'hidden',
      width: '100%',
    },
    leftPart: {
      justifyContent: 'center',
      paddingRight: theme.sizeXS,
    },
    middlePart: {
      overflow: 'hidden',
      flexGrow: 1,
      flexShrink: 1,
      paddingLeft: theme.sizeXS,
      paddingRight: theme.sizeXS,
      justifyContent: 'center',
    },
    rightPart: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    upperText: {
      ...FontSemiBold,
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.lineHeightHeading5 * theme.fontSizeHeading5,
      color: theme.colorTextLight1,
      fontWeight: theme.headingFontWeight,
    },
    lowerText: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.lineHeightSM * theme.fontSizeSM,
      color: theme.colorTextLight4,
    },
    arrowWrapper: {
      width: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colorTextLight4,
    },
    mainIconWrapper: {
      position: 'relative',
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainIconBackground: {
      opacity: 0.1,
      borderRadius: 20,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    logoWrapper: {
      position: 'absolute',
      right: 0,
      bottom: 0,
    },
  });
};
