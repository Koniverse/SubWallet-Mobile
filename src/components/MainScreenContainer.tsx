import React from 'react';
import {SafeAreaView, StatusBar, View} from 'react-native';
import { Header } from 'components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import {ColorMap} from "styles/color";
import {STATUS_BAR_LIGHT_CONTENT} from "styles/sharedStyles";

interface Props {
  children: JSX.Element;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const MainScreenContainer = ({ children, navigation }: Props) => {
  return (
    <View>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark2,
        }}>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} />
      </SafeAreaView>
      <Header navigation={navigation} />
      {children}
    </View>
  );
};
