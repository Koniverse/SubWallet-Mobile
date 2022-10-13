// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import React, { useRef } from 'react';

import { bnToBn, formatNumber } from '@polkadot/util';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';

interface Props {
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  url: string;
}

function mortalityAsString(era: ExtrinsicEra, hexBlockNumber: string): string {
  if (era.isImmortalEra) {
    return i18n.common.immortal;
  }

  const blockNumber = bnToBn(hexBlockNumber);
  const mortal = era.asMortalEra;

  return (
    i18n.common.immortalValidFrom +
    formatNumber(mortal.birth(blockNumber)) +
    i18n.common.to +
    formatNumber(mortal.death(blockNumber))
  );
}

const itemWrapperStyle: StyleProp<any> = {
  paddingBottom: 8,
};

const labelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  flex: 1,
  paddingRight: 8,
};

const valueStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  flex: 1,
};

export const Extrinsic = ({
  payload: { era, nonce, tip },
  request: { blockNumber, genesisHash, method, specVersion: hexSpec },
  url,
}: Props) => {
  const specVersion = useRef(bnToBn(hexSpec)).current;

  return (
    <ScrollView style={{ width: '100%', marginTop: 32, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.from}</Text>
        <Text style={valueStyle}>{url}</Text>
      </View>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.genesis}</Text>
        <Text style={valueStyle}>{genesisHash}</Text>
      </View>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.versionLabel}</Text>
        <Text style={valueStyle}>{specVersion.toNumber()}</Text>
      </View>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.nonce}</Text>
        <Text style={valueStyle}>{formatNumber(nonce)}</Text>
      </View>
      {!tip.isEmpty && (
        <View style={itemWrapperStyle}>
          <Text style={labelStyle}>{i18n.common.tip}</Text>
          <Text style={valueStyle}>{formatNumber(tip)}</Text>
        </View>
      )}
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.method}</Text>
        <Text style={valueStyle}>{method}</Text>
      </View>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.lifetime}</Text>
        <Text style={valueStyle}>{mortalityAsString(era, blockNumber)}</Text>
      </View>
    </ScrollView>
  );
};
