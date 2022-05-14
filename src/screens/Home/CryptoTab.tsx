import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../../stores';

export const CryptoTab = () => {
  const priceStore = useSelector((state: RootState) => state.price);

  return (
    <View
      style={{alignItems: 'center', height: '100%', justifyContent: 'center'}}>
      {Object.entries(priceStore.priceMap).map(([key, val]) => (
        <View key={key}>
          <Text>
            {key}: {val}
          </Text>
        </View>
      ))}
    </View>
  );
};
