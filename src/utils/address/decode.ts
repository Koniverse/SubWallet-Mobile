import { Address } from '@ton/core';
import * as bitcoin from 'bitcoinjs-lib';

import { hexToU8a, isHex, isU8a, u8aToU8a } from '@polkadot/util';
import { decodeAddress as polkadotDecodeAddress } from '@polkadot/util-crypto';
import { Prefix } from '@polkadot/util-crypto/types';

import { getBitcoinAddressInfo, isTonAddress } from './validate';
import { BitcoinAddressType } from '@subwallet/keyring/types';

export const decodeAddress = (
  encoded?: string | Uint8Array | null,
  ignoreChecksum?: boolean,
  ss58Format: Prefix = -1,
): Uint8Array => {
  if (!encoded) {
    throw new Error('Invalid empty address passed');
  }

  if (isU8a(encoded) || isHex(encoded)) {
    return u8aToU8a(encoded);
  }

  try {
    const addressInfo = getBitcoinAddressInfo(encoded);

    if (addressInfo.network !== 'unknown') {
      if (addressInfo.type === BitcoinAddressType.p2pkh) {
        const base58 = bitcoin.address.fromBase58Check(encoded);

        return hexToU8a(base58.hash.toString('hex'));
      } else if (addressInfo.type === BitcoinAddressType.p2wpkh || addressInfo.type === BitcoinAddressType.p2tr) {
        const bech32 = bitcoin.address.fromBech32(encoded);

        return hexToU8a(bech32.data.toString('hex'));
      }
    }
  } catch (error) {}

  if (isTonAddress(encoded)) {
    const raw = Address.parseFriendly(encoded);

    return Uint8Array.from(raw.address.toStringBuffer({ bounceable: false }));
  }

  return polkadotDecodeAddress(encoded, ignoreChecksum, ss58Format);
};
