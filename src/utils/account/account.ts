import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { isSubstrateAddress, isTonAddress } from '@subwallet/keyring';

export const isAddressAllowedWithAuthType = (address: string, authAccountTypes?: AccountAuthType[]) => {
  if (isEthereumAddress(address) && authAccountTypes?.includes('evm')) {
    return true;
  }

  if (isSubstrateAddress(address) && authAccountTypes?.includes('substrate')) {
    return true;
  }

  if (isTonAddress(address) && authAccountTypes?.includes('ton')) {
    return true;
  }

  return false;
};
