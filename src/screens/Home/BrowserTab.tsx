import React from 'react';
import { Image, View } from 'react-native';

export const BrowserTab = () => {
  return (
    <View style={{ alignItems: 'center', height: '100%', justifyContent: 'center' }}>
      <Image source={require('assets/transaction-history-coming-soon.png')} />
    </View>
  );
};
