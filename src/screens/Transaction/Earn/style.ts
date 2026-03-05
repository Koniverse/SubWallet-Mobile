import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

export interface ComponentStyle {
  loadingStepContainer: ViewStyle;
  loadingWrapper: ViewStyle;
  subnetLogoAndNameStyle: ViewStyle;
  conversionRateStyle: ViewStyle;
  tooltipTextStyle: TextStyle;
  btnStyle: ViewStyle;
  highlightTextStyle: TextStyle;
  scrollViewStyle: ViewStyle;
  footer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    loadingStepContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: theme.sizeXL,
    },
    loadingWrapper: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    subnetLogoAndNameStyle: { flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS },
    conversionRateStyle: { flexDirection: 'row', alignItems: 'center' },
    tooltipTextStyle: { color: theme.colorWhite, textAlign: 'center' },
    btnStyle: { flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS },
    highlightTextStyle: { color: theme.colorPrimary, textDecorationLine: 'underline' },
    scrollViewStyle: { flex: 1, paddingHorizontal: theme.padding, marginTop: theme.margin },
    footer: { paddingHorizontal: theme.padding, paddingTop: theme.padding, ...MarginBottomForSubmitButton },
  });
};
