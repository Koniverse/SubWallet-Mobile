import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { TYPE_ACCOUNT_CAN_SIGN } from 'constants/account';
import { AccountSignType } from 'types/account';

export const findAccountByAddress = (accounts: AccountJson[], address: string): AccountJson | null => {
  try {
    if (!address) {
      return null;
    }

    const originAddress = isEthereumAddress(address) ? address : encodeAddress(decodeAddress(address));
    const result = accounts.find(account => account.address === originAddress);

    return result || null;
  } catch (e) {
    console.error('Fail to detect address', e);

    return null;
  }
};

export const getAccountSignType = (account: AccountJson | null | undefined): AccountSignType => {
  if (!account) {
    return 'Unknown';
  } else {
    if (account.address === ALL_ACCOUNT_KEY) {
      return 'All';
    } else {
      if (account.isExternal) {
        if (account.isHardware) {
          return 'Ledger';
        } else if (account.isReadOnly) {
          return 'ReadOnly';
        } else {
          return 'Qr';
        }
      } else {
        return 'Password';
      }
    }
  }
};

export const accountCanSign = (accountType: AccountSignType): boolean => {
  return TYPE_ACCOUNT_CAN_SIGN.includes(accountType);
};
