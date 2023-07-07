import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface BrowserStyle {
  imageSvgWrapper: ViewStyle;
  rightHeaderButtonTextStyle: TextStyle;
  rightHeaderButtonTextOutlineStyle: ViewStyle;
  rightHeaderButtonStyle: ViewStyle;
}

export default () => {
  // const theme = useSubWalletTheme().swThemes;
  return StyleSheet.create<BrowserStyle>({
    rightHeaderButtonStyle: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightHeaderButtonTextOutlineStyle: {
      width: 18,
      height: 18,
      borderRadius: 1,
      borderWidth: 2,
      borderColor: 'white',
      alignItems: 'center',
      marginLeft: -4,
      marginBottom: -4,
      justifyContent: 'center',
    },
    rightHeaderButtonTextStyle: {
      fontSize: 10,
      color: 'white',
      fontWeight: '700',
      lineHeight: 13,
    },
    imageSvgWrapper: { position: 'absolute', top: -6.5, right: -6.5 },
  });
};
