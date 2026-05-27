import { NativeModules, Platform } from 'react-native';

type LegacySensitiveInfoMigrationModule = {
  getLegacyBiometricPassword: () => Promise<string | null>;
};

const legacyMigration = NativeModules.LegacySensitiveInfoMigration as LegacySensitiveInfoMigrationModule | undefined;

export const getLegacyBiometricPassword = async () => {
  if (Platform.OS !== 'android' || !legacyMigration?.getLegacyBiometricPassword) {
    return null;
  }

  return legacyMigration.getLegacyBiometricPassword();
};
