import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { Header, HeaderProps } from 'components/Header';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

interface Props extends HeaderProps {
  children: JSX.Element;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  ...sharedStyles.container,
};

export const MainScreenContainer = ({ children, navigation, onPressSearchButton }: Props) => {
  return (
    <View style={containerStyle}>
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />
      {children}
      <SafeAreaView />
    </View>
  );
};
