import {Image, View} from 'react-native';
import React from 'react';
import Scanner from '../../components/QrScanner';

export const NFTTab = () => {
  return (
    <View
      style={{alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <Scanner />
    </View>
  );
};
