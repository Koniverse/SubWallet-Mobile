import { Platform, StyleProp, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { ColorMap } from 'styles/color';

export const STATUS_BAR_HEIGHT = getStatusBarHeight();
export const STATUS_BAR_LIGHT_CONTENT = 'light-content';
export const STATUS_BAR_DARK_CONTENT = 'dark-content';

export const DisabledStyle = { opacity: 0.4 };
export const FontLight = { fontFamily: 'PlusJakartaSans-Light' }; //300
export const FontRegular = { fontFamily: 'PlusJakartaSans-Regular' }; //400
export const FontMedium = { fontFamily: 'PlusJakartaSans-Medium' }; //500
export const FontSemiBold = { fontFamily: 'PlusJakartaSans-SemiBold' }; //600
export const FontBold = { fontFamily: 'PlusJakartaSans-Bold' }; //700
export const FontMonoRegular = { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }; //700
export const FontSize0 = { fontSize: 12 };
export const FontSize1 = { fontSize: 14 };
export const FontSize2 = { fontSize: 15 };
export const FontSize3 = { fontSize: 18 };
export const FontSize4 = { fontSize: 20 };
export const FontSize5 = { fontSize: 40 };
export const ContainerHorizontalPadding = { paddingLeft: 16, paddingRight: 16 };
export const MarginBottomForSubmitButton = { marginBottom: 16 };
export const ScrollViewStyle = { marginLeft: -16, marginRight: -16, ...ContainerHorizontalPadding };
export const centerStyle: StyleProp<any> = {
  justifyContent: 'center',
  flex: 1,
  alignItems: 'center',
};

export const emptyListTextStyle: StyleProp<any> = {
  ...FontSize2,
  lineHeight: 24,
  color: ColorMap.disabled,
  ...FontMedium,
  paddingTop: 8,
  textAlign: 'center',
};

export const getStatusBarPlaceholderStyle = (backgroundColor = ColorMap.dark1): StyleProp<any> => {
  return {
    top: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    height: STATUS_BAR_HEIGHT,
    backgroundColor: backgroundColor,
    zIndex: 10,
  };
};

const smallText = {
  ...FontSize1,
  lineHeight: 24,
  ...FontRegular,
};

const mainText = {
  ...FontSize2,
  lineHeight: 24,
  ...FontRegular,
};

const mediumText = {
  ...FontSize3,
  lineHeight: 24,
  ...FontRegular,
};

const largeText = {
  ...FontSize5,
  lineHeight: 52,
  ...FontRegular,
};

const textInput = {
  height: 48,
  borderRadius: 5,
  fontSize: 14,
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 8,
  ...FontRegular,
};

const blockContent = {
  paddingHorizontal: 16,
  paddingTop: 20,
  paddingBottom: 20,
  borderRadius: 5,
};

const container = {
  flex: 1,
  paddingTop: STATUS_BAR_HEIGHT,
};

const layoutContainer = {
  ...ContainerHorizontalPadding,
  paddingTop: 8,
  flex: 1,
};

export const ButtonStyle: StyleProp<any> = {
  position: 'relative',
  height: 52,
  borderRadius: 5,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: 32,
  paddingRight: 32,
};

export const TextButtonStyle: StyleProp<any> = {
  ...mediumText,
  ...FontBold,
};

export const FlatListScreenPaddingTop: StyleProp<any> = {
  // paddingTop: Platform.OS === 'android' ? 4 : STATUS_BAR_HEIGHT + 4,
};

const mb8: StyleProp<any> = {
  marginBottom: 8,
};

export const sharedStyles = StyleSheet.create({
  smallText,
  mainText,
  mediumText,
  largeText,
  textInput,
  blockContent,
  layoutContainer,
  container,
  mb8,

  inputAreaStyle: {
    ...textInput,
    textAlignVertical: 'top',
    height: 192,
  },
});
