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
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    rightHeaderButtonTextOutlineStyle: {
      width: 18,
      height: 18,
      borderRadius: 1,
      borderWidth: 2,
      borderColor: 'white',
      alignItems: 'center',
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
