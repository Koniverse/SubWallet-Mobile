import React from 'react';
import { Text, View } from 'react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { GlobeSimple } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';

export const NoInternetScreen = () => {
  return (
    <View style={centerStyle}>
      <GlobeSimple size={80} color={ColorMap.disabled} weight={'thin'} />
      <Text style={emptyListTextStyle}>No internet connection</Text>
    </View>
  );
};
