package app.subwallet.mobile

import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
    setTheme(R.style.AppTheme)
    RNBootSplash.init(this, R.style.BootTheme)
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName() = "SubWalletMobile"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
