package app.subwallet.mobile

import android.app.Application
import android.webkit.WebView
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import app.subwallet.mobile.nativeModules.RCTAppInstallerPackage
import app.subwallet.mobile.nativeModules.RCTMinimizerPackage
import com.microsoft.codepush.react.CodePush

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost by lazy {
    object : DefaultReactNativeHost(this) {
      override fun getUseDeveloperSupport() = BuildConfig.DEBUG

      override fun getPackages(): List<ReactPackage> {
        val packages = PackageList(this).packages.toMutableList()
        packages.add(RCTMinimizerPackage())
        packages.add(RCTAppInstallerPackage())
        return packages
      }

      override fun getJSMainModuleName() = "index"

      override fun getJSBundleFile(): String {
        return CodePush.getJSBundleFile()
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    WebView.setWebContentsDebuggingEnabled(true)
    SoLoader.init(this, /* native exopackage */ false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      DefaultNewArchitectureEntryPoint.load()
    }
  }
}
