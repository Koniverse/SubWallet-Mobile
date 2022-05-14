import {Image, View} from 'react-native';
import React from 'react';

export const NFTTab = () => {
  return (
    <View
      style={{alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <Image source={require('../../assets/nft-coming-soon.png')} />
    </View>
  );
};
