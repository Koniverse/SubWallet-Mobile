import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  wrapper: ViewStyle;
  header: ViewStyle;
  activeTitle: TextStyle;
  activeTokenBalance: TextStyle;
  activeTokenValue: TextStyle;
  infoContainer: ViewStyle;
  buttonContainer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      padding: theme.padding,
    },
    header: {
      alignItems: 'center',
      marginTop: theme.margin,
      marginBottom: theme.marginXXL - theme.marginXXS,
      gap: theme.sizeXXS,
    },
    activeTitle: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
    },
    activeTokenBalance: {
      ...FontSemiBold,
      lineHeight: theme.fontSizeHeading2 * theme.lineHeightHeading2,
    },
    activeTokenValue: {
      ...FontMedium,
      lineHeight: theme.fontSizeHeading5 * theme.lineHeightHeading5,
      color: theme.colorTextTertiary,
    },
    infoContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeSM,
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.sizeSM,
    },
    // body: {
    //   flex: 1,
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   paddingHorizontal: theme.padding,
    // },
    // footer: {
    //   marginTop: theme.margin,
    //   marginHorizontal: theme.margin,
    // },
  });
};
