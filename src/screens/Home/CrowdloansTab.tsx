import React from 'react';
import {Image, View} from 'react-native';

export const CrowdloansTab = () => {
  return (
    <View
      style={{alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      <Image source={require('../../assets/crowdloans-empty-list.png')} />
    </View>
  );
};
