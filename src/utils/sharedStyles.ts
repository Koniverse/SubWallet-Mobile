import {StyleSheet} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

export const FontRegular = { fontFamily: 'Lexend-Regular' };
export const STATUS_BAR_HEIGHT = getStatusBarHeight();
export const STATUS_BAR_LIGHT_CONTENT = 'light-content';
export const STATUS_BAR_DARK_CONTENT = 'dark-content';
const largerText = {
  fontSize: 15,
  lineHeight: 26,
  ...FontRegular,
}

const mainText = {
  fontSize: 14,
  lineHeight: 24,
  ...FontRegular,
}

const textInput = {
  height: 48,
  borderRadius: 8,
  fontSize: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  ...FontRegular,
};

export const sharedStyles = StyleSheet.create({
  mainText,
  largerText,
  textInput,

  inputStyle: {

  }
})
