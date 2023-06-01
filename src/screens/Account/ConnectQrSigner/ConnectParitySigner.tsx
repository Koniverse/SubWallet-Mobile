// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ImageLogosMap } from 'assets/logo';
import React from 'react';
import ConnectQrSigner from './index';
import i18n from 'utils/i18n/i18n';

type Props = {};

const ConnectParitySigner: React.FC<Props> = () => {
  return (
    <ConnectQrSigner
      description={i18n.attachAccount.connectPolkadotVaultMessage2}
      instructionUrl={'Connect your QR wallet'}
      logoUrl={ImageLogosMap.parity}
      subTitle={i18n.attachAccount.connectPolkadotVaultMessage1}
      title={i18n.header.connectPolkadotVault}
    />
  );
};

export default ConnectParitySigner;
