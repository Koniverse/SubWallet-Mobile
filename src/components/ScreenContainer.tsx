import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import {
  getStatusBarPlaceholderStyle,
  sharedStyles,
  STATUS_BAR_HEIGHT,
  STATUS_BAR_LIGHT_CONTENT,
} from 'styles/sharedStyles';

interface Props {
  children: JSX.Element;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  position: 'relative',
  ...sharedStyles.container,
  paddingTop: STATUS_BAR_HEIGHT + 13.5,
};

export const ScreenContainer = ({ children }: Props) => {
  return (
    <View style={containerStyle}>
      <View style={getStatusBarPlaceholderStyle(ColorMap.dark2)} />
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      {children}
      <SafeAreaView />
    </View>
  );
};
