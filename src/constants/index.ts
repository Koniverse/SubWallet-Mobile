import { KeypairType } from '@polkadot/util-crypto/types';
import { Dimensions, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getBrand } from 'react-native-device-info';

type DeviceInfo = {
  isIos: boolean;
  isAndroid: boolean;
  width: number;
  height: number;
};

export const WIKI_URL = 'https://docs.subwallet.app/';
export const PRIVACY_AND_POLICY_URL = 'https://docs.subwallet.app/privacy-and-security/privacy-policy';
export const TERMS_OF_SERVICE_URL = 'https://docs.subwallet.app/privacy-and-security/terms-of-service';
export const WEBSITE_URL = 'https://subwallet.app/';
export const TELEGRAM_URL = 'https://t.me/subwallet';
export const TWITTER_URL = 'https://twitter.com/subwalletapp';
export const DISCORD_URL = 'https://discord.com/invite/vPCN4vdB8v';
export const BUTTON_ACTIVE_OPACITY = 0.5;
export const ALLOW_FONT_SCALING = false;
export const HIDE_MODAL_DURATION = 1000;
export const SUBSTRATE_ACCOUNT_TYPE: KeypairType = 'sr25519';
export const EVM_ACCOUNT_TYPE: KeypairType = 'ethereum';
export const DEFAULT_ACCOUNT_TYPES: KeypairType[] = [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE];
const window = Dimensions.get('window');
export const deviceWidth = window.width;
export const deviceHeight = window.height;
export const BOTTOM_BAR_HEIGHT = 60;
export const statusBarHeight = getStatusBarHeight();
export enum BitLengthOption {
  CHAIN_SPEC = 128,
  NORMAL_NUMBERS = 32,
}
export const TOAST_DURATION = getBrand().toLowerCase() === 'xiaomi' ? 5000 : 1500;
export const CELL_COUNT = 6;
export const DEVICE: DeviceInfo = {
  isIos: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  width: deviceWidth,
  height: deviceHeight,
};
export const ALL_KEY = 'all';
