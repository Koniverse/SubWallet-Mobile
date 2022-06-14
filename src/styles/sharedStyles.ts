import { StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const FontRegular = { fontFamily: 'SpaceGrotesk-Regular' };
export const FontMedium = { fontFamily: 'SpaceGrotesk-Medium' };
export const FontSemiBold = { fontFamily: 'SpaceGrotesk-SemiBold' };
export const FontBold = { fontFamily: 'SpaceGrotesk-Bold' };
export const STATUS_BAR_HEIGHT = getStatusBarHeight();
export const STATUS_BAR_LIGHT_CONTENT = 'light-content';
export const STATUS_BAR_DARK_CONTENT = 'dark-content';

const smallText = {
  fontSize: 14,
  lineHeight: 24,
  ...FontRegular,
};

const mainText = {
  fontSize: 15,
  lineHeight: 26,
  ...FontRegular,
};

const mediumText = {
  fontSize: 18,
  lineHeight: 25,
  ...FontRegular,
};

const mediumText2 = {
  fontSize: 20,
  lineHeight: 26,
  ...FontBold,
};

const largeText = {
  fontSize: 40,
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
  mediumText2,
  largeText,
  textInput,

  inputAreaStyle: {
    ...textInput,
    height: 80,
  },
});
