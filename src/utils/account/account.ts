import { ethereumEncode, isEthereumAddress } from '@polkadot/util-crypto';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { isAccountAll } from 'utils/accountAll';
import { decodeAddress } from 'utils/address/decode';
import { KeypairType } from '@subwallet/keyring/types';
import { encodeAddress } from 'utils/address/encode';
import { getKeypairTypeByAddress, isTonAddress } from 'utils/address/validate';
import {
  _isChainEvmCompatible,
  _isChainSubstrateCompatible,
  _isChainTonCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { _ChainInfo } from '@subwallet/chain-list/types';

export const isAddressAllowedWithAuthType = (address: string, authAccountTypes?: AccountAuthType[]) => {
  if (authAccountTypes?.includes('evm')) {
    return true;
  }

  if (authAccountTypes?.includes('substrate')) {
    return true;
  }

  if (authAccountTypes?.includes('ton')) {
    return true;
  }

  return false;
};

export function reformatAddress(address: string, networkPrefix = 42, isEthereum = false): string {
  try {
    if (!address || address === '') {
      return '';
    }

    if (isEthereumAddress(address)) {
      return address;
    }

    if (isAccountAll(address)) {
      return address;
    }

    const publicKey = decodeAddress(address);

    if (isEthereum) {
      return ethereumEncode(publicKey);
    }

    const type: KeypairType = getKeypairTypeByAddress(address);

    if (networkPrefix < 0) {
      return address;
    }

    return encodeAddress(publicKey, networkPrefix, type);
  } catch (e) {
    console.warn('Get error while reformat address', address, e);

    return address;
  }
}

export function isSameAddress(address1: string, address2: string) {
  if (isEthereumAddress(address1)) {
    return address1.toLowerCase() === address2.toLowerCase();
  }

  return reformatAddress(address1, 0) === reformatAddress(address2, 0); // TODO: maybe there's a better way
}

export function isAddressAndChainCompatible(address: string, chain: _ChainInfo) {
  const isEvmCompatible = isEthereumAddress(address) && _isChainEvmCompatible(chain);
  const isTonCompatible = isTonAddress(address) && _isChainTonCompatible(chain);
  const isSubstrateCompatible =
    !isEthereumAddress(address) && !isTonAddress(address) && _isChainSubstrateCompatible(chain); // todo: need isSubstrateAddress util function to check exactly

  return isEvmCompatible || isSubstrateCompatible || isTonCompatible;
}
