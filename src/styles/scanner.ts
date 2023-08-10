import { deviceHeight, deviceWidth } from 'constants/index';
import {
  bottomOverlayHeight,
  overlayColor,
  rectBorderColor,
  rectBorderWidth,
  rectDimensions,
  topOverlayHeight,
} from 'constants/scanner';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';

const ContainerStyle: StyleProp<ViewStyle> = {
  margin: 0,
  padding: 0,
  backgroundColor: 'transparent',
};

const SafeAreaStyle: StyleProp<ViewStyle> = { backgroundColor: ColorMap.buttonOverlayButtonColor };

const CameraStyle: StyleProp<ViewStyle> = {
  height: deviceHeight,
};

const RectangleContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  alignItems: 'center',
  backgroundColor: overlayColor,
};

const TopOverlayStyle: StyleProp<ViewStyle> = {
  height: topOverlayHeight,
  width: deviceWidth,
  backgroundColor: overlayColor,
  // paddingTop: 13,
};

const CenterOverlayStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  backgroundColor: 'transparent',
  height: rectDimensions,
};

const BottomOverlayStyle: StyleProp<ViewStyle> = {
  flex: 1,
  height: bottomOverlayHeight,
  width: deviceWidth,
  backgroundColor: overlayColor,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const CenterTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  ...FontSemiBold,
};

const LeftAndRightOverlayStyle: StyleProp<ViewStyle> = {
  height: rectDimensions,
  width: deviceWidth,
  backgroundColor: overlayColor,
};

const RectangleStyle: StyleProp<ViewStyle> = {
  height: rectDimensions,
  width: rectDimensions,
  borderWidth: rectBorderWidth,
  borderColor: rectBorderColor,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
};

const HeaderStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
};

const HeaderTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  ...FontSemiBold,
};

const HeaderSubTitleStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  bottom: 60,
};

const HeaderSubTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
  textAlign: 'center',
  ...FontMedium,
};

const LogoContainerStyle: StyleProp<ViewStyle> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 20,
  borderWidth: 2,
  borderColor: ColorMap.secondary,
  marginBottom: 16,
};

export const ScannerStyles = StyleSheet.create({
  ContainerStyle,
  SafeAreaStyle,
  CameraStyle,
  RectangleContainerStyle,
  TopOverlayStyle,
  CenterOverlayStyle,
  BottomOverlayStyle,
  CenterTextStyle,
  LeftAndRightOverlayStyle,
  RectangleStyle,
  HeaderStyle,
  HeaderTitleTextStyle,
  LogoContainerStyle,
  HeaderSubTitleStyle,
  HeaderSubTitleTextStyle,
});
