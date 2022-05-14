import React from 'react';
import {Image, View} from 'react-native';

export const StakingTab = () => {
  return (
    <View
      style={{alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <Image source={require('../../assets/stacking-empty-list.png')} />
    </View>
  );
};
