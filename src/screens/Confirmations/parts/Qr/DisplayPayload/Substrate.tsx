// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { wrapBytes } from '@subwallet/extension-dapp';
import DisplayPayload from 'components/Payload/DisplayPayload';
import React, { useMemo } from 'react';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';

interface Props {
  address: string;
  genesisHash: string;
  payload: ExtrinsicPayload | string;
}

const SubstrateQr: React.FC<Props> = (props: Props) => {
  const { address, genesisHash, payload } = props;

  const payloadU8a = useMemo(() => (typeof payload === 'string' ? wrapBytes(payload) : payload.toU8a()), [payload]);
  const isMessage = useMemo(() => typeof payload === 'string', [payload]);

  return (
    <DisplayPayload
      address={address}
      genesisHash={genesisHash}
      isEthereum={false}
      isHash={false}
      isMessage={isMessage}
      hashPayload={payloadU8a}
    />
  );
};

export default SubstrateQr;
