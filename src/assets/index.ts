import React from 'react';
import { ImageLogosMap } from 'assets/logo';

const SubWalletLogo = React.lazy(() => import('./sub-wallet-logo.svg'));
const SubWalletLogo2 = React.lazy(() => import('./logo-subwallet.svg'));
const ReceiveIcon = React.lazy(() => import('./receive-icon.svg'));
const SendIcon = React.lazy(() => import('./send-icon.svg'));
const SwapIcon = React.lazy(() => import('./swap-icon.svg'));
const CheckBoxIcon = React.lazy(() => import('./checkbox.svg'));
const CheckBoxFilledIcon = React.lazy(() => import('./checkbox-filled.svg'));

export const Logo = {
  SubWallet: SubWalletLogo,
};

export const SVGImages = {
  Logo,
  ReceiveIcon: ReceiveIcon,
  SendIcon: SendIcon,
  SwapIcon: SwapIcon,
  CheckBoxIcon: CheckBoxIcon,
  CheckBoxFilledIcon: CheckBoxFilledIcon,
  SubWallet2: SubWalletLogo2,
};

export const Images = {
  ...ImageLogosMap,
  loading: require('./loading.gif'),
  stackingEmptyList: require('./stacking-empty-list.png'),
  successStatusImg: require('./success-status.png'),
  failStatusImg: require('./fail-status.png'),
  loadingScreen: require('./loading-background.jpg'),
  historyEmpty: require('./transaction-history-coming-soon.png'),
};
