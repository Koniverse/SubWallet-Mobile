import SInfo, { SensitiveInfoOptions } from 'react-native-sensitive-info';
import { Alert } from 'react-native';
import i18n from './i18n/i18n';

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
    return true;
  } catch (e) {
    alertFailedAttempts(e);
    console.warn('set keychain failed', e);
    return false;
  }
};

export const getKeychainPassword = async () => {
  try {
    // v6 returns an object { key, service, value, metadata } | null instead of a raw string.
    const sensitiveInfo = await SInfo.getItem(username, keychainConfig);
    return sensitiveInfo?.value;
  } catch (e) {
    alertFailedAttempts(e);
    throw e;
  }
};

export const resetKeychainPassword = async () => {
  try {
    // return await Keychain.resetGenericPassword();
    SInfo.deleteItem(username, keychainConfig);
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
