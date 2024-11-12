import * as bitcoin from 'bitcoinjs-lib';
import { BitcoinAddressInfo, BitcoinAddressType, BitcoinNetwork, KeypairType } from '@subwallet/keyring/types';
import { Address } from '@ton/core';
import { base58Decode, checkAddressChecksum, isEthereumAddress } from '@polkadot/util-crypto';
import { isHex, isU8a } from '@polkadot/util';
import { defaults } from '@polkadot/util-crypto/address/defaults';

const addressTypes: { [key: number]: { type: BitcoinAddressType; network: BitcoinNetwork } } = {
  0x00: {
    type: BitcoinAddressType.p2pkh,
    network: 'mainnet',
  },

  0x6f: {
    type: BitcoinAddressType.p2pkh,
    network: 'testnet',
  },

  0x05: {
    type: BitcoinAddressType.p2sh,
    network: 'mainnet',
  },

  0xc4: {
    type: BitcoinAddressType.p2sh,
    network: 'testnet',
  },
};

const parseBech32 = (address: string): BitcoinAddressInfo => {
  let decoded;

  try {
    decoded = bitcoin.address.fromBech32(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  const mapPrefixToNetwork: { [key: string]: BitcoinNetwork } = {
    bc: 'mainnet',
    tb: 'testnet',
    bcrt: 'regtest',
  };

  const network: BitcoinNetwork = mapPrefixToNetwork[decoded.prefix];

  if (network === undefined) {
    throw new Error('Invalid address');
  }

  let type: BitcoinAddressType;

  if (decoded.data.length === 20) {
    type = BitcoinAddressType.p2wpkh;
  } else if (decoded.version === 1) {
    type = BitcoinAddressType.p2tr;
  } else {
    type = BitcoinAddressType.p2wsh;
  }

  return {
    bech32: true,
    network,
    address,
    type,
  };
};

export const getBitcoinAddressInfo = (address: string): BitcoinAddressInfo => {
  let decoded: bitcoin.address.Base58CheckResult;
  const prefix = address.substr(0, 2).toLowerCase();

  if (prefix === 'bc' || prefix === 'tb') {
    return parseBech32(address);
  }

  try {
    decoded = bitcoin.address.fromBase58Check(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  const version = decoded.version;

  const validVersions = Object.keys(addressTypes).map(Number);

  if (!validVersions.includes(version)) {
    throw new Error('Invalid address');
  }

  const addressType = addressTypes[version];

  return {
    ...addressType,
    address,
    bech32: false,
  };
};

export const isSubstrateAddress = (address: string, ss58Format = -1): boolean => {
  try {
    if (!address) {
      throw new Error('Invalid empty address passed');
    }

    if (isU8a(address) || isHex(address)) {
      throw new Error('Invalid empty address passed');
    }

    const decoded = base58Decode(address);

    if (!defaults.allowedEncodedLengths.includes(decoded.length)) {
      throw new Error('Invalid decoded address length');
    }

    const [isValid, , , ss58Decoded] = checkAddressChecksum(decoded);

    if (!isValid) {
      throw new Error('Invalid decoded address checksum');
    } else if (ss58Format !== -1 && ss58Format !== ss58Decoded) {
      throw new Error(`Expected ss58Format ${ss58Format}, received ${ss58Decoded}`);
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const isTonAddress = (address: string): boolean => {
  try {
    const raw = Address.parse(address);

    return !!raw;
  } catch (error) {
    return false;
  }
};

export const getKeypairTypeByAddress = (address: string): KeypairType => {
  if (isEthereumAddress(address)) {
    return 'ethereum';
  }

  try {
    const addressInfo = getBitcoinAddressInfo(address);

    if (addressInfo.network === 'mainnet') {
      switch (addressInfo.type) {
        case BitcoinAddressType.p2wpkh:
          return 'bitcoin-84';
        case BitcoinAddressType.p2pkh:
          return 'bitcoin-44';
        case BitcoinAddressType.p2tr:
          return 'bitcoin-86';
      }
    } else {
      switch (addressInfo.type) {
        case BitcoinAddressType.p2wpkh:
          return 'bittest-84';
        case BitcoinAddressType.p2pkh:
          return 'bittest-44';
        case BitcoinAddressType.p2tr:
          return 'bittest-86';
      }
    }
  } catch (e) {}

  if (isTonAddress(address)) {
    return 'ton-native';
  }

  return 'sr25519';
};
