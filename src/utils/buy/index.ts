import { InAppBrowserOptions } from 'react-native-inappbrowser-reborn';
import { ColorMap } from 'styles/color';

export { createBanxaOrder } from './banxa';
export { createCoinbaseOrder } from './coinbase';
export { createTransakOrder } from './transak';

export const BrowserOptions: InAppBrowserOptions = {
  // iOS Properties
  dismissButtonStyle: 'done',
  preferredBarTintColor: ColorMap.dark1,
  preferredControlTintColor: ColorMap.light,
  animated: true,
  modalEnabled: true,
  enableBarCollapsing: false,
  // Android Properties
  showTitle: true,
  toolbarColor: ColorMap.dark1,
  secondaryToolbarColor: ColorMap.dark1,
  navigationBarColor: ColorMap.dark1,
  navigationBarDividerColor: 'white',
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: false,
  // Specify full animation resource identifier(package:anim/name)
  // or only resource name(in case of animation bundled with app).
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right',
  },
  headers: {
    'my-custom-header': 'my custom header value',
  },
  hasBackButton: true,
  browserPackage: undefined,
  showInRecents: true,
  includeReferrer: true,
};
