import { AccountAuthType } from '@subwallet/extension-base/background/types';

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
