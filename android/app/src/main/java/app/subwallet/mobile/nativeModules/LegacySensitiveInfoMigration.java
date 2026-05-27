package app.subwallet.mobile.nativeModules;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import androidx.annotation.NonNull;
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
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

public class LegacySensitiveInfoMigration extends ReactContextBaseJavaModule {
  private static final String ANDROID_KEYSTORE_PROVIDER = "AndroidKeyStore";
  private static final String AES_DEFAULT_TRANSFORMATION =
      KeyProperties.KEY_ALGORITHM_AES + "/" +
          KeyProperties.BLOCK_MODE_CBC + "/" +
          KeyProperties.ENCRYPTION_PADDING_PKCS7;
  private static final String KEY_ALIAS_AES = "MyAesKeyAlias";
  private static final String SHARED_PREFERENCES_NAME = "swSharedPrefs";
  private static final String PASSWORD_KEY = "sw-user";
  private static final String DELIMITER = "]";

  private final ReactApplicationContext reactContext;

  LegacySensitiveInfoMigration(ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
  }

  @Override
  public String getName() {
    return "LegacySensitiveInfoMigration";
  }

  @ReactMethod
  public void getLegacyBiometricPassword(Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      promise.resolve(null);
      return;
    }

    String encrypted = getLegacyPreferences().getString(PASSWORD_KEY, null);
    if (encrypted == null || encrypted.length() == 0) {
      promise.resolve(null);
      return;
    }

    UiThreadUtil.runOnUiThread(() -> authenticateAndDecrypt(encrypted, promise));
  }

  private SharedPreferences getLegacyPreferences() {
    return reactContext.getSharedPreferences(SHARED_PREFERENCES_NAME, Context.MODE_PRIVATE);
  }

  private void authenticateAndDecrypt(String encrypted, Promise promise) {
    try {
      Activity activity = getCurrentActivity();
      if (!(activity instanceof FragmentActivity)) {
        promise.reject("E_NO_ACTIVITY", "Current activity is not available for biometric migration.");
        return;
      }

      String[] inputs = encrypted.split(Pattern.quote(DELIMITER), 2);
      if (inputs.length < 2) {
        promise.resolve(null);
        return;
      }

      byte[] iv = Base64.decode(inputs[0], Base64.DEFAULT);
      byte[] cipherBytes = Base64.decode(inputs[1], Base64.DEFAULT);
      KeyStore keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER);
      keyStore.load(null);

      SecretKey secretKey = (SecretKey) keyStore.getKey(KEY_ALIAS_AES, null);
      if (secretKey == null) {
        promise.resolve(null);
        return;
      }

      Cipher cipher = Cipher.getInstance(AES_DEFAULT_TRANSFORMATION);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));

      Executor executor = Executors.newSingleThreadExecutor();
      BiometricPrompt biometricPrompt = new BiometricPrompt(
          (FragmentActivity) activity,
          executor,
          new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
              try {
                Cipher authenticatedCipher = result.getCryptoObject() != null
                    ? result.getCryptoObject().getCipher()
                    : cipher;
                byte[] decryptedBytes = authenticatedCipher.doFinal(cipherBytes);
                promise.resolve(new String(decryptedBytes));
              } catch (Exception e) {
                promise.reject("E_LEGACY_DECRYPT_FAILED", e);
              }
            }

            @Override
            public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
              promise.reject(String.valueOf(errorCode), errString.toString());
            }
          });

      BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
          .setTitle("Unlock app using biometric")
          .setNegativeButtonText("Cancel")
          .setDeviceCredentialAllowed(false)
          .build();

      biometricPrompt.authenticate(promptInfo, new BiometricPrompt.CryptoObject(cipher));
    } catch (Exception e) {
      promise.reject("E_LEGACY_BIOMETRIC_UNAVAILABLE", e);
    }
  }
}
