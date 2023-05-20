// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ImageLogosMap } from 'assets/logo';
import React from 'react';
import ConnectQrSigner from './index';

type Props = {};

const ConnectParitySigner: React.FC<Props> = () => {
  return (
    <ConnectQrSigner
      description={'Polkadot Vault will provide you a QR code to scan.'}
      instructionUrl={'Connect your QR wallet'}
      logoUrl={ImageLogosMap.parity}
      subTitle={'Open Polkadot Vault application on your smartphone to connect wallet'}
      title={'Connect your QR wallet'}
    />
  );
};

export default ConnectParitySigner;
