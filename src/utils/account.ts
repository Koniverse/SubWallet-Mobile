import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { MODE_CAN_SIGN } from 'constants/signer';
import { SIGN_MODE } from 'types/signer';
import {AccountAddressType, AccountSignMode} from 'types/index';

export const findAccountByAddress = (accounts: AccountJson[], address?: string): AccountJson | null => {
  try {
    if (!address) {
      return null;
    }

    if (address === ALL_ACCOUNT_KEY) {
      const result = accounts.find(account => account.address.toLowerCase() === originAddress.toLowerCase());

      return result || null;
    }

    const originAddress = isEthereumAddress(address) ? address : encodeAddress(decodeAddress(address));
    const result = accounts.find(account => account.address.toLowerCase() === originAddress.toLowerCase());

    return result || null;
  } catch (e) {
    console.error('Fail to detect address', e);

    return null;
  }
};

export const getAccountSignMode = (account: AccountJson | null | undefined): SIGN_MODE => {
  if (!account) {
    return SIGN_MODE.UNKNOWN;
  } else {
    if (account.address === ALL_ACCOUNT_KEY) {
      return SIGN_MODE.ALL_ACCOUNT;
    } else {
      if (account.isExternal) {
        if (account.isHardware) {
          return SIGN_MODE.LEDGER;
        } else if (account.isReadOnly) {
          return SIGN_MODE.READ_ONLY;
        } else {
          return SIGN_MODE.QR;
        }
      } else {
        return SIGN_MODE.PASSWORD;
      }
    }
  }
};

export const accountCanSign = (signMode: SIGN_MODE): boolean => {
  return MODE_CAN_SIGN.includes(signMode);
};

export const filterNotReadOnlyAccount = (accounts: AccountJson[]): AccountJson[] => {
  return accounts.filter(acc => !acc.isReadOnly);
};

export const getAccountAddressType = (address?: string): AccountAddressType => {
  if (!address) {
    return AccountAddressType.UNKNOWN;
  }

  if (address === ALL_ACCOUNT_KEY) {
    return AccountAddressType.ALL;
  }

  if (isEthereumAddress(address)) {
    return AccountAddressType.ETHEREUM;
  }

  try {
    decodeAddress(address);

    return AccountAddressType.SUBSTRATE;
  } catch (e) {
    return AccountAddressType.UNKNOWN;
  }
};

export const getSignMode = (account: AccountJson | null | undefined): AccountSignMode => {
  if (!account) {
    return AccountSignMode.UNKNOWN;
  } else {
    if (account.address === ALL_ACCOUNT_KEY) {
      return AccountSignMode.ALL_ACCOUNT;
    } else {
      if (account.isExternal) {
        if (account.isHardware) {
          return AccountSignMode.LEDGER;
        } else if (account.isReadOnly) {
          return AccountSignMode.READ_ONLY;
        } else {
          return AccountSignMode.QR;
        }
      } else {
        return AccountSignMode.PASSWORD;
      }
    }
  }
};
