// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import React, { useRef } from 'react';

import { bnToBn, formatNumber } from '@polkadot/util';
import { Text, View } from 'react-native';

interface Props {
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  url: string;
}

//todo: i18n
function mortalityAsString(era: ExtrinsicEra, hexBlockNumber: string): string {
  if (era.isImmortalEra) {
    return 'immortal';
  }

  const blockNumber = bnToBn(hexBlockNumber);
  const mortal = era.asMortalEra;

  return (
    'mortal, valid from' + formatNumber(mortal.birth(blockNumber)) + 'to' + formatNumber(mortal.death(blockNumber))
  );
}

export const Extrinsic = ({
  payload: { era, nonce, tip },
  request: { blockNumber, genesisHash, method, specVersion: hexSpec },
  url,
}: Props) => {
  const specVersion = useRef(bnToBn(hexSpec)).current;

  //todo: i18n
  return (
    <View>
      <View>
        <Text>from</Text>
        <Text>{url}</Text>
      </View>
      <View>
        <Text>genesis</Text>
        <Text>{genesisHash}</Text>
      </View>
      <View>
        <Text>version</Text>
        <Text>{specVersion.toNumber()}</Text>
      </View>
      <View>
        <Text>nonce</Text>
        <Text>{formatNumber(nonce)}</Text>
      </View>
      {!tip.isEmpty && (
        <View>
          <Text>tip</Text>
          <Text>{formatNumber(tip)}</Text>
        </View>
      )}
      <View>
        <Text>method data</Text>
        <Text>{method}</Text>
      </View>
      <View>
        <Text>lifetime</Text>
        <Text>{mortalityAsString(era, blockNumber)}</Text>
      </View>
    </View>
  );
};
