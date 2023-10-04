import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { overlayColor, rectDimensions } from 'constants/scanner';
import Svg, { Path } from 'react-native-svg';

const container: StyleProp<any> = {
  alignItems: 'center',
  justifyContent: 'center',
  height: rectDimensions,
  width: rectDimensions,
  backgroundColor: 'transparent',
};

const BorderRadius = rectDimensions * 0.0625;
const BorderOverlaySize = rectDimensions * 0.09375;

const barcodeFinderBorder: StyleProp<any> = {
  position: 'absolute',
  height: rectDimensions * 0.125,
  width: rectDimensions * 0.125,
  borderColor: '#004BFF',
};

const overlayCommonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  width: BorderOverlaySize,
  height: BorderOverlaySize,
  aspectRatio: 1,
};

const overlayTopLeftStyle: StyleProp<any> = {
  ...overlayCommonStyle,
  top: 0,
  transform: [{ rotateX: '180deg' }],
  left: 0,
};

const overlayBottomLeftStyle: StyleProp<any> = {
  ...overlayCommonStyle,
  bottom: 0,
  left: 0,
};

const overlayTopRightStyle: StyleProp<ViewStyle> = {
  ...overlayCommonStyle,
  bottom: 0,
  right: 0,
  transform: [{ rotateY: '180deg' }],
};

const overlayBottomRightStyle: StyleProp<ViewStyle> = {
  ...overlayCommonStyle,
  top: 0,
  right: 0,
  transform: [{ rotateX: '180deg' }, { rotateY: '180deg' }],
};

const borderTopLeftStyle: StyleProp<ViewStyle> = {
  ...barcodeFinderBorder,
  top: 0,
  left: 0,
  borderTopWidth: 2,
  borderLeftWidth: 2,
  borderTopLeftRadius: BorderRadius,
};

const borderBottomLeftStyle: StyleProp<ViewStyle> = {
  ...barcodeFinderBorder,
  top: 0,
  right: 0,
  borderTopWidth: 2,
  borderRightWidth: 2,
  borderTopRightRadius: BorderRadius,
};

const borderTopRightStyle: StyleProp<ViewStyle> = {
  ...barcodeFinderBorder,
  bottom: 0,
  left: 0,
  borderBottomWidth: 2,
  borderLeftWidth: 2,
  borderBottomLeftRadius: BorderRadius,
};

const borderBottomRightStyle: StyleProp<ViewStyle> = {
  ...barcodeFinderBorder,
  bottom: 0,
  right: 0,
  borderBottomWidth: 2,
  borderRightWidth: 2,
  borderBottomRightRadius: BorderRadius,
};

const renderOverlaySvg = () => (
  <Svg
    width={`${BorderOverlaySize}`}
    height={`${BorderOverlaySize}`}
    fill={overlayColor}
    strokeWidth={1}
    viewBox={`0 0 ${BorderOverlaySize} ${BorderOverlaySize}`}>
    <Path d={`M0 0L0 ${BorderOverlaySize}L${BorderOverlaySize} ${BorderOverlaySize}Q${0} ${BorderOverlaySize} 0 0 `} />
  </Svg>
);

export const BarcodeFinder = () => {
  return (
    <View style={container}>
      <View style={{ height: '100%', width: '100%', borderRadius: BorderRadius }}>
        <View style={overlayTopLeftStyle}>{renderOverlaySvg()}</View>
        <View style={overlayBottomLeftStyle}>{renderOverlaySvg()}</View>
        <View style={overlayTopRightStyle}>{renderOverlaySvg()}</View>
        <View style={overlayBottomRightStyle}>{renderOverlaySvg()}</View>
        <View style={borderTopLeftStyle} />
        <View style={borderBottomLeftStyle} />
        <View style={borderTopRightStyle} />
        <View style={borderBottomRightStyle} />
      </View>
    </View>
  );
};
