package app.subwallet.mobile.nativeModules;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.content.Intent;
import android.content.pm.InstallSourceInfo;
import android.content.pm.PackageManager;
import android.net.Uri;

import androidx.core.content.FileProvider;

import java.io.File;

public class RCTAppInstaller extends ReactContextBaseJavaModule {
  private ReactApplicationContext reactContext;
  RCTAppInstaller(ReactApplicationContext context) {
    super(context);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "AppInstaller";
  }

  @ReactMethod
  public void install(String path) {
    File apkFile = new File(path);
    Uri apkUri = FileProvider.getUriForFile(
            getReactApplicationContext(),
            getReactApplicationContext().getPackageName() + ".fileprovider",
            apkFile
    );

    Intent intent = new Intent(Intent.ACTION_VIEW);
    intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

    getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void verifyInstallerId(Callback callback) {
    // A list with valid installers package name
    // List<String> validInstallers = new ArrayList<>(Arrays.asList("com.android.vending", "com.google.android.feedback"));

    // The package name of the app that has installed your app
    String installer;
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
      try {
        InstallSourceInfo installSourceInfo = getReactApplicationContext().getPackageManager().getInstallSourceInfo(getReactApplicationContext().getPackageName());

        installer = installSourceInfo.getInstallingPackageName();
      } catch (PackageManager.NameNotFoundException e) {
        installer = "Error:" + String.valueOf(e);
      }
    } else installer = getReactApplicationContext().getPackageManager().getInstallerPackageName(getReactApplicationContext().getPackageName());

    // true if your app has been downloaded from Play Store 
    callback.invoke(installer);
  }
}
