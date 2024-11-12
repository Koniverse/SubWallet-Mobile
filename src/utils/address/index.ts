import { Prefix } from '@polkadot/util-crypto/types';
import { decodeAddress } from 'utils/address/decode';

export const validateAddress = (
  encoded?: string | null,
  ignoreChecksum?: boolean,
  ss58Format?: Prefix,
): encoded is string => !!decodeAddress(encoded, ignoreChecksum, ss58Format);

export const isAddress = (
  address?: string | null,
  ignoreChecksum?: boolean,
  ss58Format?: Prefix,
): address is string => {
  try {
    return validateAddress(address, ignoreChecksum, ss58Format);
  } catch {
    return false;
  }
};
