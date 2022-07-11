import { KeypairType } from '@polkadot/util-crypto/types';
import { Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const BUTTON_ACTIVE_OPACITY = 0.5;
export const HIDE_MODAL_DURATION = 500;
export const SUBSTRATE_ACCOUNT_TYPE: KeypairType = 'sr25519';
export const EVM_ACCOUNT_TYPE: KeypairType = 'ethereum';
const window = Dimensions.get('window');
export const deviceWidth = window.width;
export const deviceHeight = window.height;
export const statusBarHeight = getStatusBarHeight();
export enum BitLengthOption {
  CHAIN_SPEC = 128,
  NORMAL_NUMBERS = 32,
}
