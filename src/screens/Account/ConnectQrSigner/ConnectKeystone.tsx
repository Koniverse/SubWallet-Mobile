// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ImageLogosMap } from 'assets/logo';
import React from 'react';
import ConnectQrSigner from './index';

type Props = {};

const ConnectKeystone: React.FC<Props> = () => {
  return (
    <ConnectQrSigner
      description={'Keystone will provide you QR code to scan'}
      instructionUrl={'Connect your QR wallet'}
      logoUrl={ImageLogosMap.keystone}
      subTitle={'Select the SubWallet option in the “Software Wallet” menu available in your Keystone'}
      title={'Connect your Keystone'}
    />
  );
};

export default ConnectKeystone;
