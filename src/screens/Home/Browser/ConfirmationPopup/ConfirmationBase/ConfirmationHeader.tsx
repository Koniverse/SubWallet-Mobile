import React from 'react';
import { Image, StyleProp, Text, View } from 'react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

export interface ConfirmationHeaderType {
  title: string;
  hostName: string;
}

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 16,
};

export const ConfirmationHeader = ({ title, hostName }: ConfirmationHeaderType) => {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 56, height: 56 }} />
      <Text style={titleStyle}>{title}</Text>
    </View>
  );
};
