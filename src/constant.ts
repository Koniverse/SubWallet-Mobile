import { KeypairType } from '@polkadot/util-crypto/types';

export const BUTTON_ACTIVE_OPACITY = 0.5;
export const SUBSTRATE_ACCOUNT_TYPE: KeypairType = 'sr25519';
export const EVM_ACCOUNT_TYPE: KeypairType = 'ethereum';

export enum BitLengthOption {
  CHAIN_SPEC = 128,
  NORMAL_NUMBERS = 32,
}
