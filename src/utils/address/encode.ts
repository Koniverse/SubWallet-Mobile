import type { HexString } from '@polkadot/util/types';

import { Address } from '@ton/core';
import * as bitcoin from 'bitcoinjs-lib';

import { encodeAddress as polkadotEncodeAddress } from '@polkadot/util-crypto';
import { Prefix } from '@polkadot/util-crypto/types';

import { decodeAddress } from './decode';
import {
  BitcoinKeypairTypes,
  BitcoinMainnetKeypairTypes,
  BitcoinTestnetKeypairTypes,
  KeypairType,
  TonKeypairTypes,
} from '@subwallet/keyring/types';

/**
 * Encodes a given key into a specific address format based on the provided type.
 *
 * @param {HexString | Uint8Array | string} key - The key to be encoded. It can be a HexString, Uint8Array, or string.
 * @param {Prefix} [ss58Format=42] - The SS58 format to use for encoding. Defaults to 42.
 *   - For Substrate-based chains, this is the network address format.
 *   - For Ton based chains, this is 0 for testnet and other values for mainnet.
 * @param {KeypairType} [type] - The type of keypair to determine the encoding format. It can be one of the following:
 *   - 'bitcoin-44': Encodes the key as a Bitcoin P2PKH address.
 *   - 'bitcoin-84': Encodes the key as a Bitcoin P2WPKH address.
 *   - 'bitcoin-86': Encodes the key as a Bitcoin P2TR address.
 *   - 'bittest-44': Encodes the key as a Bitcoin testnet P2PKH address.
 *   - 'bittest-84': Encodes the key as a Bitcoin testnet P2WPKH address.
 *   - 'bittest-86': Encodes the key as a Bitcoin testnet P2TR address.
 *   - 'ton': Encodes the key as a TON address.
 *   - 'ton-native': Encodes the key as a TON address.
 *   - If no type is provided or the type is not one of the above, it defaults to encoding as a Polkadot address.
 * @returns {string} - The encoded address as a string.
 */
export const encodeAddress = (
  key: HexString | Uint8Array | string,
  ss58Format: Prefix = 42,
  type?: KeypairType,
): string => {
  // decode it, this means we can re-encode an address
  const u8a = decodeAddress(key);

  if (!type) {
    return polkadotEncodeAddress(u8a, ss58Format);
  }

  if (BitcoinKeypairTypes.includes(type)) {
    const network = BitcoinMainnetKeypairTypes.includes(type)
      ? bitcoin.networks.bitcoin
      : BitcoinTestnetKeypairTypes.includes(type)
      ? bitcoin.networks.testnet
      : bitcoin.networks.regtest;

    if (type === 'bitcoin-44' || type === 'bittest-44') {
      return bitcoin.address.toBase58Check(Buffer.from(u8a), network.pubKeyHash);
    }

    if (type === 'bitcoin-84' || type === 'bittest-84') {
      return bitcoin.address.toBech32(Buffer.from(u8a), 0, network.bech32);
    }

    if (type === 'bitcoin-86' || type === 'bittest-86') {
      return bitcoin.address.toBech32(Buffer.from(u8a), 1, network.bech32);
    }
  }

  if (TonKeypairTypes.includes(type)) {
    const rs = Address.parseFriendly(Buffer.from(u8a));
    const testOnly = ss58Format === 0;

    return rs.address.toString({ bounceable: false, testOnly });
  }

  return polkadotEncodeAddress(u8a, ss58Format);
};
