package app.subwallet.mobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import android.os.Bundle
import org.devio.rn.splashscreen.SplashScreen
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    // Add this method.
   override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        SplashScreen.show(this)
        super.onCreate(null)
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SubWalletMobile"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
