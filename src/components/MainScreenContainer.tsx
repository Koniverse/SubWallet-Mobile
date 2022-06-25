import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { Header } from 'components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

interface Props {
  children: JSX.Element;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const containerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  ...sharedStyles.container,
};

export const MainScreenContainer = ({ children, navigation }: Props) => {
  return (
    <View style={containerStyle}>
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <Header navigation={navigation} />
      {children}
      <SafeAreaView />
    </View>
  );
};
