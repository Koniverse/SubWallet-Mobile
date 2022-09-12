import React from 'react';
import { Image, StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getHostName } from 'utils/browser';

export interface ConfirmationHeaderType {
  title: string;
  url: string;
}

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 16,
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

export const ConfirmationHeader = ({ title, url }: ConfirmationHeaderType) => {
  const hostName = getHostName(url);

  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 56, height: 56 }} />
      <Text style={titleStyle}>{title}</Text>
      <Text style={[textStyle, { paddingTop: 3, textAlign: 'center' }]}>{hostName}</Text>
    </View>
  );
};
