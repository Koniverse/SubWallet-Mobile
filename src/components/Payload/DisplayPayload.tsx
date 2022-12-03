import QrPayload from 'components/Payload/QrPayload';
import React, { useMemo } from 'react';

import { createSignPayload } from '@polkadot/react-qr/util';
import { numberToU8a, u8aConcat, u8aToU8a } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { StyleProp, ViewStyle } from 'react-native';
import { HashPayloadProps } from 'types/signer';

interface Props extends HashPayloadProps {
  size?: string | number;
  style?: StyleProp<ViewStyle>;
}

const ETHEREUM_ID = new Uint8Array([0x45]);

const CMD = {
  ETHEREUM: {
    SIGN_HASH: 0,
    SIGN_TRANSACTION: 1,
    SIGN_MESSAGE: 2,
  },
  SUBSTRATE: {
    SIGN_MORTAL: 0,
    SIGN_HASH: 1,
    SIGN_IMMORTAL: 2,
    SIGN_MSG: 3,
  },
};

const DisplayPayload = (props: Props) => {
  const { address, genesisHash, isEthereum, isHash, isMessage, hashPayload, size, style } = props;

  const cmd = useMemo(() => {
    if (isEthereum) {
      if (isMessage) {
        return isHash ? CMD.ETHEREUM.SIGN_HASH : CMD.ETHEREUM.SIGN_MESSAGE;
      } else {
        return CMD.ETHEREUM.SIGN_TRANSACTION;
      }
    } else {
      if (isMessage) {
        return CMD.SUBSTRATE.SIGN_MSG;
      } else {
        return isHash ? CMD.SUBSTRATE.SIGN_HASH : CMD.SUBSTRATE.SIGN_IMMORTAL;
      }
    }
  }, [isEthereum, isHash, isMessage]);

  const data = useMemo(() => {
    if (!address) {
      return new Uint8Array(0);
    }
    if (isEthereum) {
      return u8aConcat(ETHEREUM_ID, numberToU8a(cmd), decodeAddress(address), u8aToU8a(hashPayload));
    } else {
      // EVM genesisHash have _evm or _anyString at end
      const genesis = genesisHash.split('_')[0];

      return createSignPayload(address, cmd, hashPayload, genesis);
    }
  }, [address, cmd, hashPayload, genesisHash, isEthereum]);

  if (!data) {
    return null;
  }

  return <QrPayload size={size} style={style} value={data} />;
};

export default React.memo(DisplayPayload);
