import React from 'react';
import { Image, StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getHostName } from 'utils/browser';
import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { getNetworkLogo } from 'utils/index';

export interface ConfirmationHeaderType {
  title: string;
  url: string;
  targetNetwork?: NetworkJson | null;
  senderAccount?: AccountJson;
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
    ...FontMedium,
    color: color,
  };
}

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

function renderTargetAccount(address: string, name?: string) {
  return (
    <View style={targetWrapperStyle}>
      <SubWalletAvatar address={address} size={14} />
      <Text numberOfLines={1} style={targetTextStyle}>
        {name}
      </Text>
    </View>
  );
}

function renderCurrentChain(networkKey: string, chain?: string) {
  return (
    <View style={targetWrapperStyle}>
      {getNetworkLogo(networkKey, 24)}
      <Text numberOfLines={1} style={targetTextStyle}>
        {chain}
      </Text>
    </View>
  );
}

const renderSenderAccountAndTransactionFrom = (targetNetwork?: NetworkJson | null, senderAccount?: AccountJson) => {
  if (!(senderAccount && targetNetwork)) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', paddingVertical: 8, alignItems: 'center' }}>
      {senderAccount && renderTargetAccount(senderAccount.address, senderAccount.name)}
      {targetNetwork && (
        <>
          <Text style={[getTextStyle(ColorMap.light), { paddingHorizontal: 8 }]}>{i18n.common.on}</Text>
          {renderCurrentChain(targetNetwork.key, targetNetwork.chain)}
        </>
      )}
    </View>
  );
};

export const ConfirmationHeader = ({ title, url, targetNetwork, senderAccount }: ConfirmationHeaderType) => {
  const hostName = getHostName(url);

  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 56, height: 56 }} />
      <Text style={titleStyle}>{title}</Text>
      <Text style={[getTextStyle(ColorMap.disabled), { paddingTop: 3, textAlign: 'center' }]}>{hostName}</Text>
      {renderSenderAccountAndTransactionFrom(targetNetwork, senderAccount)}
    </View>
  );
};
