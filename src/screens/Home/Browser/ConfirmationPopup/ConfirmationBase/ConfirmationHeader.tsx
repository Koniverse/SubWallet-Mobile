import React from 'react';
import { Image, StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSemiBold, FontSize0, sharedStyles } from 'styles/sharedStyles';
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

function getTextStyle(color: string) {
  return {
    ...sharedStyles.mainText,
    ...FontSize0,
    ...FontMedium,
    color: color,
  };
}

export const ConfirmationHeader = ({ title, url }: ConfirmationHeaderType) => {
  const hostName = getHostName(url);

  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 54, height: 54 }} />
      <Text style={titleStyle}>{title}</Text>
      <Text style={[getTextStyle(ColorMap.disabled), { textAlign: 'center' }]}>{hostName}</Text>
    </View>
  );
};
