import { KeypairType } from '@polkadot/util-crypto/types';
import { Dimensions, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getBrand } from 'react-native-device-info';
import env from 'react-native-config';

type DeviceInfo = {
  isIos: boolean;
  isAndroid: boolean;
  width: number;
  height: number;
};

type RegexType = {
  httpProtocol: RegExp;
};

export const WIKI_URL = 'https://docs.subwallet.app/';
export const PRIVACY_AND_POLICY_URL = 'https://docs.subwallet.app/privacy-and-security/privacy-policy';
export const TERMS_OF_SERVICE_URL = 'https://docs.subwallet.app/privacy-and-security/terms-of-service';
export const TERMS_OF_USE_URL = 'https://docs.subwallet.app/main/privacy-and-security/terms-of-use';
export const IMPORT_QR_CODE_URL =
  'https://docs.subwallet.app/main/mobile-app-user-guide/account-management/import-restore-an-account#import-by-qr-code';
export const BACKUP_SEED_PHRASE_CODE_URL =
  'https://docs.subwallet.app/main/mobile-app-user-guide/account-management/export-and-backup-an-account';
export const POLKADOT_VAULT_INSTRUCTION_URL =
  'https://docs.subwallet.app/main/mobile-app-user-guide/account-management/attach-a-polkadot-vault-previously-parity-signer-account';
export const KEYSTONE_INSTRUCTION_URL =
  'https://docs.subwallet.app/main/mobile-app-user-guide/account-management/connect-keystone-device';
export const WEBSITE_URL = 'https://subwallet.app/';
export const GITHUB_REPOS_URL = 'https://api.github.com/repos/Koniverse/SubWallet-Mobile/releases?per_page=5&page=1';
export const APPSTORE_URL = 'https://apps.apple.com/us/app/subwallet-polkadot-wallet/id1633050285';
export const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=app.subwallet.mobile';
export const TELEGRAM_URL = 'https://t.me/subwallet';
export const TWITTER_URL = 'https://twitter.com/subwalletapp';
export const DISCORD_URL = 'https://discord.com/invite/vPCN4vdB8v';
export const STATIC_DATA_DOMAIN = 'https://static-data.subwallet.app';
export const TOKEN_CONFIG_URL = `${STATIC_DATA_DOMAIN}/tokens/config.json`;
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
export const TOAST_DURATION = getBrand().toLowerCase() === 'xiaomi' ? 5000 : 4000;
export const CELL_COUNT = 6;
export const DEVICE: DeviceInfo = {
  isIos: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  width: deviceWidth,
  height: deviceHeight,
};
export const ALL_KEY = 'all';
export const isDevMode = !!env.DEBUG;
export const regex: RegexType = {
  httpProtocol: /^http:\/\//,
};
export const WEBVIEW_ANDROID_SYSTEM_MIN_VERSION = 113;
