import { ImageLogosMap } from 'assets/logo';
import React from 'react';
import ConnectQrSigner from './index';
import i18n from 'utils/i18n/i18n';
import { KEYSTONE_INSTRUCTION_URL } from 'constants/index';

type Props = {};

const ConnectKeystone: React.FC<Props> = () => {
  return (
    <ConnectQrSigner
      description={i18n.attachAccount.connectKeystoneMessage2}
      instructionUrl={KEYSTONE_INSTRUCTION_URL}
      logoUrl={ImageLogosMap.keystone}
      subTitle={i18n.attachAccount.connectKeystoneMessage1}
      title={i18n.header.connectKeystoneDevice}
    />
  );
};

export default ConnectKeystone;
