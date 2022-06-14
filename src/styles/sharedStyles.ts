import { StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const FontRegular = { fontFamily: 'SpaceGrotesk-Regular' };
export const FontMedium = { fontFamily: 'SpaceGrotesk-Medium' };
export const FontSemiBold = { fontFamily: 'SpaceGrotesk-SemiBold' };
export const FontBold = { fontFamily: 'SpaceGrotesk-Bold' };
export const STATUS_BAR_HEIGHT = getStatusBarHeight();
export const STATUS_BAR_LIGHT_CONTENT = 'light-content';
export const STATUS_BAR_DARK_CONTENT = 'dark-content';
export const FontSize1 = { fontSize: 14 };
export const FontSize2 = { fontSize: 15 };
export const FontSize3 = { fontSize: 18 };
export const FontSize4 = { fontSize: 20 };
export const FontSize5 = { fontSize: 40 };

const smallText = {
  ...FontSize1,
  lineHeight: 24,
  ...FontRegular,
};

const mainText = {
  ...FontSize2,
  lineHeight: 26,
  ...FontRegular,
};

const mediumText = {
  ...FontSize3,
  lineHeight: 25,
  ...FontRegular,
};

const largeText = {
  ...FontSize5,
  lineHeight: 51,
  ...FontRegular,
};

const textInput = {
  height: 48,
  borderRadius: 8,
  fontSize: 14,
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 8,
  ...FontRegular,
};

export const sharedStyles = StyleSheet.create({
  smallText,
  mainText,
  mediumText,
  largeText,
  textInput,

  inputAreaStyle: {
    ...textInput,
    height: 80,
  },
});
