import SInfo, { SensitiveInfoOptions } from 'react-native-sensitive-info';
import { Alert, Platform } from 'react-native';
import i18n from './i18n/i18n';
import { readLegacyKeychainPassword } from './legacyKeychain';
import { mmkvStore } from 'utils/storage';

// Keep in sync with utils/account/account.ts — once the master password has
// been written under the v6 namespace, skip the legacy iCloud-sync lookup that
// would otherwise trigger a redundant FaceID prompt on every launch.
const KEYCHAIN_V6_MIGRATED_KEY = 'keychainV6Migrated';

// Keychain configuration — react-native-sensitive-info v6 (Nitro) API.
// `service` MUST stay 'swKeychain' so items written by older app versions
// (which used the legacy `keychainService` option) remain readable after an
// update. Keep this in sync with the duplicate config in utils/account/account.ts.
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
export const createKeychainPassword = async (password: string) => {
  try {
    await SInfo.setItem(username, password, keychainConfig);
    mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
    return true;
  } catch (e) {
    alertFailedAttempts(e);
    console.warn('set keychain failed', e);
    return false;
  }
};

export const getKeychainPassword = async () => {
  try {
    // iOS: until the master password has been re-stored under the v6 namespace,
    // skip the v6 lookup entirely. The v5 entry only exists in the iCloud-sync
    // namespace, and running both queries triggers two FaceID prompts per launch.
    if (Platform.OS === 'ios' && !mmkvStore.getBoolean(KEYCHAIN_V6_MIGRATED_KEY)) {
      const legacyInfo = await SInfo.getItem(username, { ...keychainConfig, iosSynchronizable: true });
      if (legacyInfo?.value) {
        try {
          await SInfo.setItem(username, legacyInfo.value, keychainConfig);
          await SInfo.deleteItem(username, { ...keychainConfig, iosSynchronizable: true });
        } catch (err) {
          console.warn('keychain v5->v6 migration failed', err);
        }
        mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
        return legacyInfo.value;
      }
    }

    // v6 returns an object { key, service, value, metadata } | null instead of a raw string.
    let sensitiveInfo = await SInfo.getItem(username, keychainConfig);

    if (!sensitiveInfo) {
      // Backward compatibility: the classic (pre-v6) react-native-sensitive-info
      // stored items with kSecAttrSynchronizable = Any, so iOS keeps them as
      // iCloud-synchronizable Keychain entries. v6 only queries non-synchronizable
      // items by default, so retry as a synchronizable lookup to find items
      // written by older app versions.
      sensitiveInfo = await SInfo.getItem(username, { ...keychainConfig, iosSynchronizable: true });
    }

    if (sensitiveInfo?.value) {
      if (Platform.OS === 'ios') {
        mmkvStore.set(KEYCHAIN_V6_MIGRATED_KEY, true);
      }
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
      // Best-effort re-store; even if this fails the caller still gets the password.
      await createKeychainPassword(legacyPassword);
      return legacyPassword;
    }

    return undefined;
  } catch (e) {
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
    // v6 removed `isSensorAvailable()`; use the security-levels API instead.
    const levels = await SInfo.getSupportedSecurityLevels();
    return { available: levels.biometry };
  } catch (e) {
    console.warn('Get failed!');
    return null;
  }
};
