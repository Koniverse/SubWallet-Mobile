import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { getNetworkLogo } from 'utils/index';

const targetWrapperStyle: StyleProp<any> = {
  borderRadius: 5,
  backgroundColor: ColorMap.dark1,
  paddingHorizontal: 16,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
};

const targetTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  paddingLeft: 8,
  maxWidth: 100,
};

export function renderTargetAccount(address: string, name?: string) {
  return (
    <View style={targetWrapperStyle}>
      <SubWalletAvatar address={address} size={14} />
      <Text numberOfLines={1} style={targetTextStyle}>
        {name}
      </Text>
    </View>
  );
}

export function renderCurrentChain(networkKey: string, chain?: string) {
  return (
    <View style={targetWrapperStyle}>
      {getNetworkLogo(networkKey, 24)}
      <Text numberOfLines={1} style={targetTextStyle}>
        {chain}
      </Text>
    </View>
  );
}
