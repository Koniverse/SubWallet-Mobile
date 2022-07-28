import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { Header, HeaderProps } from 'components/Header';
import { ColorMap } from 'styles/color';
import {
  getStatusBarPlaceholderStyle,
  sharedStyles,
  STATUS_BAR_HEIGHT,
  STATUS_BAR_LIGHT_CONTENT,
} from 'styles/sharedStyles';

interface Props extends HeaderProps {
  children: JSX.Element;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  position: 'relative',
  ...sharedStyles.container,
  paddingTop: STATUS_BAR_HEIGHT + 13.5,
};

export const MainScreenContainer = ({ children, navigation, onPressSearchButton }: Props) => {
  return (
    <View style={containerStyle}>
      <View style={getStatusBarPlaceholderStyle(ColorMap.dark2)} />
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />
      {children}
      <SafeAreaView />
    </View>
  );
};
