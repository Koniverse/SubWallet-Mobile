import { ImageLogosMap } from 'assets/logo';
import React from 'react';
import ConnectQrSigner from './index';
import i18n from 'utils/i18n/i18n';
import { POLKADOT_VAULT_INSTRUCTION_URL } from 'constants/index';

type Props = {};

const ConnectParitySigner: React.FC<Props> = () => {
  return (
    <ConnectQrSigner
      description={i18n.attachAccount.connectPolkadotVaultMessage2}
      instructionUrl={POLKADOT_VAULT_INSTRUCTION_URL}
      logoUrl={ImageLogosMap.parity}
      subTitle={i18n.attachAccount.connectPolkadotVaultMessage1}
      title={i18n.header.connectPolkadotVault}
    />
  );
};

export default ConnectParitySigner;
