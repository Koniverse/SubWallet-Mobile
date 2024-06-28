import QrPayload from 'components/Payload/QrPayload';
import React, { useMemo } from 'react';

import { numberToU8a, u8aConcat, u8aToU8a } from '@polkadot/util';
import { decodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { StyleProp, ViewStyle } from 'react-native';
import { HashPayloadProps } from 'types/signer';
import { CMD, CRYPTO_ETHEREUM, CRYPTO_SR25519, ETHEREUM_ID, SUBSTRATE_ID } from 'constants/qr';

interface Props extends HashPayloadProps {
  size?: string | number;
  style?: StyleProp<ViewStyle>;
}

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
    if (isEthereum) {
      return u8aConcat(ETHEREUM_ID, numberToU8a(cmd), decodeAddress(address), u8aToU8a(hashPayload));
    } else {
      const isEvm = isEthereumAddress(address);
      const crypto = isEvm ? CRYPTO_ETHEREUM : CRYPTO_SR25519;

      return u8aConcat(
        SUBSTRATE_ID,
        crypto,
        new Uint8Array([cmd]),
        decodeAddress(address),
        u8aToU8a(hashPayload),
        u8aToU8a(genesisHash),
      );
    }
  }, [address, cmd, hashPayload, genesisHash, isEthereum]);

  if (!data) {
    return null;
  }

  return <QrPayload size={size} style={style} value={data} />;
};

export default React.memo(DisplayPayload);
