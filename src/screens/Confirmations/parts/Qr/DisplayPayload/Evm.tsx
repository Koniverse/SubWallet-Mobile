// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DisplayPayload from 'components/Payload/DisplayPayload';
import React, { useMemo } from 'react';

import { u8aToU8a } from '@polkadot/util';

interface Props {
  address: string;
  hashPayload: string;
  isMessage: boolean;
}

const EvmQr: React.FC<Props> = (props: Props) => {
  const { address, hashPayload, isMessage } = props;

  const payloadU8a = useMemo((): Uint8Array => u8aToU8a(hashPayload), [hashPayload]);

  return (
    <DisplayPayload
      address={address}
      genesisHash={''}
      isEthereum={true}
      isHash={false}
      isMessage={isMessage}
      hashPayload={payloadU8a}
    />
  );
};

export default EvmQr;
