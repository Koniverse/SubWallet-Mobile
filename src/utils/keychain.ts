import SInfo, { RNSensitiveInfoOptions } from 'react-native-sensitive-info';
import { Alert } from 'react-native';
import i18n from './i18n/i18n';

// Keychain configuration
const keychainConfig: RNSensitiveInfoOptions = {
  touchID: true,
  showModal: true,
  kSecAccessControl: 'kSecAccessControlBiometryCurrentSet',
  sharedPreferencesName: 'swSharedPrefs',
  keychainService: 'swKeychain',
  kSecAttrAccessible: 'kSecAttrAccessibleWhenUnlocked',
  kSecUseOperationPrompt: 'Unlock app using biometric',
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
    const password = await SInfo.getItem(username, keychainConfig);
    return password;
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
    const result = await SInfo.isSensorAvailable();
    return result;
  } catch (e) {
    console.warn('Get failed!');
    return null;
  }
};
