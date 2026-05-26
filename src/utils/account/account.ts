import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { AbstractAddressJson, AccountChainType, AccountJson, AccountSignMode } from '@subwallet/extension-base/types';
import { isAddress, isSubstrateAddress, isTonAddress } from '@subwallet/keyring';
import { KeypairType } from '@subwallet/keyring/types';
import { BitcoinAccountInfo } from 'types/account';
import { isAccountAll, reformatAddress, uniqueStringArray } from '@subwallet/extension-base/utils';
import { MODE_CAN_SIGN } from 'constants/signer';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { DEFAULT_ACCOUNT_TYPES, EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE, TON_ACCOUNT_TYPE } from 'constants/index';
import SInfo, { SensitiveInfoOptions } from 'react-native-sensitive-info';
import { Alert, Platform } from 'react-native';
import i18n from 'utils/i18n/i18n.ts';
import ReactNativeBiometrics from 'react-native-biometrics';
import { readLegacyKeychainPassword } from '../legacyKeychain';
import { mmkvStore } from 'utils/storage';

// Set once the master password has been written under the v6 (non-synchronizable)
// namespace. While unset on iOS we treat the keychain as still hosting the v5
// iCloud-synchronizable entry and skip the v6 lookup — querying both namespaces
// when only the sync one has the item triggers two FaceID prompts per launch.
const KEYCHAIN_V6_MIGRATED_KEY = 'keychainV6Migrated';

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

export function getChainTypeLogoMap(): Record<string, string> {
  return {
    [AccountChainType.SUBSTRATE]: 'polkadot',
    [AccountChainType.ETHEREUM]: 'ethereum',
    [AccountChainType.BITCOIN]: 'bitcoin',
    [AccountChainType.TON]: 'ton',
    [AccountChainType.CARDANO]: 'cardano',
  };
}

export const findAccountByAddress = (accounts: AccountJson[], address?: string): AccountJson | null => {
  try {
    const isAllAccount = address && isAccountAll(address);
    if (!isAddress(address) && !isAllAccount) {
      return null;
    }

    const originAddress = isAccountAll(address) ? address : reformatAddress(address);
    const result = accounts.find(account => account.address.toLowerCase() === originAddress.toLowerCase());

    return result || null;
  } catch (e) {
    console.error('Fail to detect address', e);

    return null;
  }
};

export const accountCanSign = (signMode: AccountSignMode): boolean => {
  return MODE_CAN_SIGN.includes(signMode);
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
          if (account.isGeneric) {
            return AccountSignMode.GENERIC_LEDGER;
          } else {
            return AccountSignMode.LEGACY_LEDGER;
          }
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

export const isNoAccount = (accounts: AccountJson[] | null): boolean => {
  return accounts ? !accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY).length : false;
};

export const funcSortByName = (a: AbstractAddressJson, b: AbstractAddressJson) => {
  if (isAccountAll(b.address)) {
    return 3;
  }

  return (a?.name || '').toLowerCase() > (b?.name || '').toLowerCase() ? 1 : -1;
};

export const findContactByAddress = (contacts: AbstractAddressJson[], address?: string): AbstractAddressJson | null => {
  try {
    const isAllAccount = address && isAccountAll(address);
    if (!isAddress(address) && !isAllAccount) {
      return null;
    }

    const originAddress = isAccountAll(address) ? address : reformatAddress(address);
    const result = contacts.find(contact => contact.address.toLowerCase() === originAddress.toLowerCase());

    return result || null;
  } catch (e) {
    console.error(`Fail to detect address ${address}`, e);

    return null;
  }
};

export const convertKeyTypes = (authTypes: AccountAuthType[]): KeypairType[] => {
  const result: KeypairType[] = [];

  for (const authType of authTypes) {
    if (authType === 'evm') {
      result.push(EVM_ACCOUNT_TYPE);
    } else if (authType === 'substrate') {
      result.push(SUBSTRATE_ACCOUNT_TYPE);
    } else if (authType === 'ton') {
      result.push(TON_ACCOUNT_TYPE);
    }
  }

  const _rs = uniqueStringArray(result) as KeypairType[];

  return _rs.length ? _rs : DEFAULT_ACCOUNT_TYPES;
};

export function getReformatedAddressRelatedToChain(
  accountJson: AccountJson,
  chainInfo: _ChainInfo,
): string | undefined {
  if (accountJson.specialChain && accountJson.specialChain !== chainInfo.slug) {
    return undefined;
  }

  if (!_isChainInfoCompatibleWithAccountInfo(chainInfo, accountJson)) {
    return undefined;
  }

  if (accountJson.chainType === AccountChainType.SUBSTRATE && chainInfo.substrateInfo) {
    return reformatAddress(accountJson.address, chainInfo.substrateInfo.addressPrefix);
  } else if (accountJson.chainType === AccountChainType.ETHEREUM && chainInfo.evmInfo) {
    return accountJson.address;
  } else if (accountJson.chainType === AccountChainType.TON && chainInfo.tonInfo) {
    return reformatAddress(accountJson.address, chainInfo.isTestnet ? 0 : 1);
  } else if (accountJson.chainType === AccountChainType.CARDANO && chainInfo.cardanoInfo) {
    return reformatAddress(accountJson.address, chainInfo.isTestnet ? 0 : 1);
  } else if (accountJson.chainType === AccountChainType.BITCOIN && chainInfo.bitcoinInfo) {
    return accountJson.address;
  }

  return undefined;
}

// Keychain configuration — react-native-sensitive-info v6 (Nitro) API.
// `service` MUST stay 'swKeychain' so items written by older app versions
// (which used the legacy `keychainService` option) remain readable after an
// update. v6 silently ignores the pre-v6 option keys (`keychainService`,
// `kSecAccessControl`, `kSecAttrAccessible`...) and defaults `service` to
// 'default' — that mismatch is what broke biometric unlock after updating.
const keychainConfig: SensitiveInfoOptions = {
  service: 'swKeychain',
  accessControl: 'biometryCurrentSet',
  authenticationPrompt: {
    title: 'Unlock app using biometric',
  },
};
const maxAttempsData = ['Biometry is locked out', 'Quá nhiều lần thử', 'Too many attempts'];
function alertFailedAttempts(e: any) {
  let isFailedAttemps = false;
  maxAttempsData.map(item => {
    if (JSON.stringify(e).includes(item)) {
      isFailedAttemps = true;
    }
  });
  if (isFailedAttemps) {
    Alert.alert(i18n.buttonTitles.unlockWithBiometric, i18n.common.tooManyAttemps);
  }
}
const username = 'sw-user';

// DEBUG-ONLY: in-memory log buffer surfaced via getBioDebugLog() so we can
// show breadcrumbs in an Alert from release builds (where console.log is
// stripped). Remove once the biometric double-prompt is diagnosed.
const bioDebugBuffer: string[] = [];
const bioLog = (msg: string) => {
  const stamp = String(Date.now() % 100000).padStart(5, '0');
  bioDebugBuffer.push(`${stamp} ${msg}`);
  if (bioDebugBuffer.length > 80) {
    bioDebugBuffer.shift();
  }
};
export const getBioDebugLog = () => bioDebugBuffer.join('\n');
export const resetBioDebugLog = () => bioDebugBuffer.splice(0);
export const pushBioDebugLog = (msg: string) => bioLog(msg);

export const createKeychainPassword = async (password: string) => {
  bioLog('createKeychainPassword: enter');
  try {
    bioLog('createKeychainPassword: deleteItem(non-sync)');
    await SInfo.deleteItem(username, keychainConfig);
    bioLog('createKeychainPassword: deleteItem(sync)');
    // Also purge any legacy iCloud-synchronizable entry written by older app versions.
    await SInfo.deleteItem(username, { ...keychainConfig, iosSynchronizable: true });
    bioLog('createKeychainPassword: setItem(non-sync) [SecItemAdd]');
    await SInfo.setItem(username, password, keychainConfig);
    mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
    bioLog('createKeychainPassword: OK, flag=true');
    return true;
  } catch (e) {
    bioLog(`createKeychainPassword: FAIL ${String(e).slice(0, 80)}`);
    alertFailedAttempts(e);
    console.warn('set keychain failed', e);
    return false;
  }
};

export const getKeychainPassword = async () => {
  const flag = mmkvStore.getBoolean(KEYCHAIN_V6_MIGRATED_KEY);
  bioLog(`getKeychainPassword: enter platform=${Platform.OS} flag=${flag}`);
  try {
    // iOS: until the master password has been re-stored under the v6 namespace,
    // skip the v6 lookup entirely. The v5 entry only exists in the iCloud-sync
    // namespace, and running both queries triggers two FaceID prompts per launch
    // (the v6 lookup hits errSecAuthFailed and Swift retries it via LAContext).
    if (Platform.OS === 'ios' && !flag) {
      bioLog('legacy path: getItem(sync) >>>');
      const legacyInfo = await SInfo.getItem(username, { ...keychainConfig, iosSynchronizable: true });
      bioLog(`legacy path: getItem(sync) <<< hasValue=${!!legacyInfo?.value}`);
      if (legacyInfo?.value) {
        try {
          bioLog('legacy path: setItem(non-sync) >>>');
          await SInfo.setItem(username, legacyInfo.value, keychainConfig);
          bioLog('legacy path: setItem(non-sync) <<<');
          bioLog('legacy path: deleteItem(sync) >>>');
          await SInfo.deleteItem(username, { ...keychainConfig, iosSynchronizable: true });
          bioLog('legacy path: deleteItem(sync) <<<');
        } catch (err) {
          bioLog(`legacy path: re-store FAIL ${String(err).slice(0, 60)}`);
          console.warn('keychain v5->v6 migration failed', err);
        }
        mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
        bioLog('legacy path: return value');
        return legacyInfo.value;
      }
    }

    // v6 returns an object { key, service, value, metadata } | null instead of a raw string.
    bioLog('main path: getItem(non-sync) >>>');
    let sensitiveInfo = await SInfo.getItem(username, keychainConfig);
    bioLog(`main path: getItem(non-sync) <<< hasObj=${!!sensitiveInfo} hasValue=${!!sensitiveInfo?.value}`);

    if (!sensitiveInfo) {
      bioLog('main path: getItem(sync) >>>');
      sensitiveInfo = await SInfo.getItem(username, { ...keychainConfig, iosSynchronizable: true });
      bioLog(`main path: getItem(sync) <<< hasValue=${!!sensitiveInfo?.value}`);
    }

    if (sensitiveInfo?.value) {
      if (Platform.OS === 'ios') {
        mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
      }
      bioLog('main path: return value');
      return sensitiveInfo.value;
    }

    // Android-only: v6 cannot read data written by v5 (incompatible storage format,
    // no built-in migration). Recover it via the vendored legacy module, then re-store
    // through v6 so future launches no longer touch the legacy path.
    const legacyPassword = await readLegacyKeychainPassword(
      i18n.buttonTitles.unlockWithBiometric,
      i18n.buttonTitles.cancel,
    );

    if (legacyPassword) {
      bioLog('android legacy: re-store');
      // Best-effort re-store; even if this fails the caller still gets the password.
      await createKeychainPassword(legacyPassword);
      return legacyPassword;
    }

    bioLog('all paths empty -> undefined');
    return undefined;
  } catch (e) {
    bioLog(`THREW ${String(e).slice(0, 80)}`);
    alertFailedAttempts(e);
    throw e;
  }
};

export const resetKeychainPassword = async () => {
  try {
    await SInfo.deleteItem(username, keychainConfig);
    // Also purge any legacy iCloud-synchronizable entry written by older app versions.
    await SInfo.deleteItem(username, { ...keychainConfig, iosSynchronizable: true });
    return true;
  } catch (e) {
    console.warn('reset keychain failed:', e);
    return false;
  }
};

export const getSupportedBiometryType = async () => {
  try {
    const rnBiometrics = new ReactNativeBiometrics();

    return await rnBiometrics.isSensorAvailable();
  } catch (e) {
    console.warn('Get failed!');
    return null;
  }
};

export function getBitcoinAccountDetails(type: KeypairType): BitcoinAccountInfo {
  const result: BitcoinAccountInfo = {
    name: 'Unknown',
    network: 'Unknown',
    order: 99,
  };

  switch (type) {
    case 'bitcoin-84':
      result.logoKey = 'bitcoin';
      result.name = 'Native SegWit';
      result.network = 'Bitcoin';
      result.order = 1;
      break;

    case 'bittest-84':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Native SegWit';
      result.network = 'Bitcoin Testnet';
      result.order = 2;
      break;

    case 'bitcoin-86':
      result.logoKey = 'bitcoin';
      result.name = 'Taproot';
      result.network = 'Bitcoin';
      result.order = 3;
      break;

    case 'bittest-86':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Taproot';
      result.network = 'Bitcoin Testnet';
      result.order = 4;
      break;

    case 'bitcoin-44':
      result.logoKey = 'bitcoin';
      result.name = 'Legacy';
      result.network = 'Bitcoin';
      result.order = 5;
      break;

    case 'bittest-44':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Legacy';
      result.network = 'Bitcoin Testnet';
      result.order = 6;
      break;
  }

  return result;
}

export const getBitcoinKeypairAttributes = (keyPairType: KeypairType): { label: string; schema: string } => {
  switch (keyPairType) {
    case 'bitcoin-44':
    case 'bittest-44':
      return { label: 'Legacy', schema: 'orange-7' };
    case 'bitcoin-86':
    case 'bittest-86':
      return { label: 'Taproot', schema: 'cyan-7' };
    case 'bitcoin-84':
    case 'bittest-84':
      return { label: 'Native SegWit', schema: 'lime-7' };
    default:
      return { label: '', schema: '' };
  }
};
