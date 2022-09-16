import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

interface Props {
  children: JSX.Element;
  backgroundColor?: string;
  safeAreaBottomViewColor?: string;
}

function getContainerStyle(backgroundColor: string): StyleProp<any> {
  return {
    backgroundColor: backgroundColor,
    position: 'relative',
    ...sharedStyles.container,
  };
}

export const ScreenContainer = ({
  children,
  backgroundColor = ColorMap.dark1,
  safeAreaBottomViewColor = ColorMap.dark1,
}: Props) => {
  return (
    <View style={getContainerStyle(backgroundColor)}>
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <View style={{ flex: 1, overflow: 'hidden' }}>{children}</View>
      <SafeAreaView style={{ backgroundColor: safeAreaBottomViewColor }} />
    </View>
  );
};
