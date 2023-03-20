import React from 'react';
import { ImageLogosMap } from 'assets/logo';

const SubWalletLogo2 = React.lazy(() => import('./logo-subwallet.svg'));
const CheckBoxIcon = React.lazy(() => import('./checkbox.svg'));
const SignalIcon = React.lazy(() => import('./signal.svg'));
const SignalSplashIcon = React.lazy(() => import('./signal-splash.svg'));
const CheckBoxFilledIcon = React.lazy(() => import('./checkbox-filled.svg'));
const NftIcon = React.lazy(() => import('./logo-nft.svg'));

export const Logo = {
  SubWallet: require('./subwallet-logo.png'),
  SubWalletGray: require('./subwallet-logo-gray.png'),
};

export const SVGImages = {
  Logo,
  CheckBoxIcon: CheckBoxIcon,
  CheckBoxFilledIcon: CheckBoxFilledIcon,
  SubWallet2: SubWalletLogo2,
  NftIcon: NftIcon,
  SignalIcon: SignalIcon,
  SignalSplashIcon: SignalSplashIcon,
};

export const Images = {
  ...ImageLogosMap,
  loading: require('./loading.gif'),
  stackingEmptyList: require('./stacking-empty-list.png'),
  successStatusImg: require('./success-status.png'),
  failStatusImg: require('./fail-status.png'),
  loadingScreen: require('./loading-background.jpg'),
  backgroundImg: require('./subwallet-background-img.png'),
  historyEmpty: require('./transaction-history-coming-soon.png'),
};
