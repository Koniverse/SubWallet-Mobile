import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { Header, HeaderProps } from 'components/Header';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { statusBarHeight } from '../constant';

interface Props extends HeaderProps {
  children: JSX.Element;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  // ...sharedStyles.container,
  flex: 1,
};

export const MainScreenContainer = ({ children, navigation, onPressSearchButton }: Props) => {
  return (
    <View style={containerStyle}>
      <SafeAreaView style={{ backgroundColor: ColorMap.dark2, position: 'relative', zIndex: 10 }}>
        <View style={{ height: Platform.OS === 'android' ? statusBarHeight : 0 }} />
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
        <View style={{ height: 13.5 }} />
      </SafeAreaView>
      <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />
      {children}
      <SafeAreaView />
    </View>
  );
};
