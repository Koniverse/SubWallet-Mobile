import React from 'react';
import { Image, View } from 'react-native';
import { Images } from 'assets/index';

export const BrowserTab = () => {
  return (
    <View style={{ alignItems: 'center', height: '100%', justifyContent: 'center' }}>
      <Image source={Images.historyEmpty} />
    </View>
  );
};
