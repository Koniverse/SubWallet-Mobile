package app.subwallet.mobile.nativeModules;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;

import java.security.KeyStore;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

/**
 * One-shot read-only migration helper.
 *
 * Vendored from react-native-sensitive-info@5.5.8 (RNSensitiveInfoModule.java), trimmed to the
 * decrypt path only. It exists so the app can recover the master password that v5 wrote into
 * SharedPreferences before the project upgraded to react-native-sensitive-info v6, whose Android
 * storage format is not backward compatible.
 *
 * Safe to delete once enough release cycles have passed that virtually all users have migrated.
 */
public class LegacyKeychainModule extends ReactContextBaseJavaModule {

  private static final String ANDROID_KEYSTORE_PROVIDER = "AndroidKeyStore";
  // v5.6 used a single global AES key alias and AES/CBC/PKCS7.
  private static final String KEY_ALIAS_AES = "MyAesKeyAlias";
  private static final String AES_TRANSFORMATION =
      KeyProperties.KEY_ALGORITHM_AES + "/"
          + KeyProperties.BLOCK_MODE_CBC + "/"
          + KeyProperties.ENCRYPTION_PADDING_PKCS7;
  private static final String DELIMITER = "]";

  public LegacyKeychainModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "LegacyKeychainModule";
  }

  private boolean canAuthenticate() {
    try {
      BiometricManager manager = BiometricManager.from(getReactApplicationContext());
      return manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
          == BiometricManager.BIOMETRIC_SUCCESS;
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * Reads a value written by react-native-sensitive-info v5.
   *
   * @param key                   the storage key (e.g. "sw-user")
   * @param sharedPreferencesName the v5 sharedPreferencesName (e.g. "swSharedPrefs")
   * @param promptTitle           biometric prompt title
   * @param promptCancel          biometric prompt negative button text
   *
   * Resolves the decrypted plaintext on success, or null when there is nothing to migrate
   * (no entry, no v5 key, or the v5 key was invalidated by a biometric change). Rejects only
   * on an explicit user cancellation so the caller can distinguish "user backed out".
   */
  @ReactMethod
  public void getLegacyItem(String key, String sharedPreferencesName,
                            String promptTitle, String promptCancel, final Promise promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(null);
        return;
      }

      SharedPreferences prefs =
          getReactApplicationContext().getSharedPreferences(sharedPreferencesName, Context.MODE_PRIVATE);
      String stored = prefs.getString(key, null);
      if (stored == null) {
        promise.resolve(null);
        return;
      }

      // Non-biometric v5 entries were stored as plaintext (no IV delimiter).
      if (!stored.contains(DELIMITER)) {
        promise.resolve(stored);
        return;
      }

      String[] parts = stored.split(DELIMITER);
      if (parts.length < 2) {
        promise.resolve(null);
        return;
      }

      if (!canAuthenticate()) {
        promise.resolve(null);
        return;
      }

      byte[] iv = Base64.decode(parts[0], Base64.DEFAULT);
      byte[] cipherBytes = Base64.decode(parts[1], Base64.DEFAULT);

      KeyStore keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER);
      keyStore.load(null);
      if (!keyStore.containsAlias(KEY_ALIAS_AES)) {
        // No v5 key — nothing we can decrypt.
        promise.resolve(null);
        return;
      }

      SecretKey secretKey = (SecretKey) keyStore.getKey(KEY_ALIAS_AES, null);
      Cipher cipher = Cipher.getInstance(AES_TRANSFORMATION);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));

      showBiometricPrompt(promptTitle, promptCancel, cipher, cipherBytes, promise);
    } catch (Exception e) {
      // Key invalidated / unrecoverable / device changed: treat as "nothing to migrate".
      promise.resolve(null);
    }
  }

  private void showBiometricPrompt(final String promptTitle, final String promptCancel,
                                   final Cipher cipher, final byte[] cipherBytes,
                                   final Promise promise) {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          Activity activity = getCurrentActivity();
          if (!(activity instanceof FragmentActivity)) {
            promise.resolve(null);
            return;
          }

          Executor executor = Executors.newSingleThreadExecutor();
          BiometricPrompt biometricPrompt = new BiometricPrompt(
              (FragmentActivity) activity,
              executor,
              new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                  try {
                    Cipher authedCipher = result.getCryptoObject() != null
                        ? result.getCryptoObject().getCipher() : cipher;
                    byte[] decrypted = authedCipher.doFinal(cipherBytes);
                    promise.resolve(new String(decrypted));
                  } catch (Exception e) {
                    promise.resolve(null);
                  }
                }

                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                  if (errorCode == BiometricPrompt.ERROR_USER_CANCELED
                      || errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON
                      || errorCode == BiometricPrompt.ERROR_CANCELED) {
                    promise.reject("USER_CANCELED", errString.toString());
                  } else {
                    // Lockout / hardware error — let the caller fall through to manual unlock.
                    promise.resolve(null);
                  }
                }
              });

          BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
              .setTitle(promptTitle != null ? promptTitle : "Unlock app using biometric")
              .setNegativeButtonText(promptCancel != null ? promptCancel : "Cancel")
              .build();

          biometricPrompt.authenticate(promptInfo, new BiometricPrompt.CryptoObject(cipher));
        } catch (Exception e) {
          promise.resolve(null);
        }
      }
    });
  }
}
