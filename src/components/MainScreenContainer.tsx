import React from 'react';
import { View } from 'react-native';
import { Header } from 'components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';

interface Props {
  children: JSX.Element;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const MainScreenContainer = ({ children, navigation }: Props) => {
  return (
    <View>
      <Header navigation={navigation} />
      {children}
    </View>
  );
};
