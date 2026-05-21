import { Platform } from 'react-native';
import { LegacyKeychainModule } from '../NativeModules';

// Storage coordinates used by react-native-sensitive-info v5 in this app.
const LEGACY_KEY = 'sw-user';
const LEGACY_SHARED_PREFS = 'swSharedPrefs';

type LegacyKeychainNativeModule = {
  getLegacyItem(
    key: string,
    sharedPreferencesName: string,
    promptTitle: string,
    promptCancel: string,
  ): Promise<string | null>;
};

/**
 * Reads the master password written by react-native-sensitive-info v5 on Android.
 *
 * react-native-sensitive-info v6 cannot read v5 data on Android (incompatible storage format,
 * no built-in migration). This calls a vendored read-only v5 decrypt path so an updating user
 * is not locked out of biometric unlock.
 *
 * Returns the recovered password, or undefined when there is nothing to migrate / the v5 key
 * was invalidated. Never throws — a cancelled or failed migration resolves to undefined so
 * the caller falls through to manual unlock.
 */
export const readLegacyKeychainPassword = async (
  promptTitle: string,
  promptCancel: string,
): Promise<string | undefined> => {
  // Only Android needs this — iOS v6 reads v5 Keychain items natively.
  if (Platform.OS !== 'android') {
    return undefined;
  }

  const nativeModule = LegacyKeychainModule as LegacyKeychainNativeModule | undefined;
  if (!nativeModule || typeof nativeModule.getLegacyItem !== 'function') {
    return undefined;
  }

  try {
    const value = await nativeModule.getLegacyItem(
      LEGACY_KEY,
      LEGACY_SHARED_PREFS,
      promptTitle,
      promptCancel,
    );

    return value ?? undefined;
  } catch (e) {
    // The native module rejects on explicit user cancellation. A cancelled migration
    // should fall through to manual unlock, not surface as an error.
    return undefined;
  }
};
