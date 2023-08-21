import React from 'react';
import { ImageLogosMap } from 'assets/logo';

const CheckBoxIcon = React.lazy(() => import('./checkbox.svg'));
const SignalIcon = React.lazy(() => import('./signal.svg'));
const SignalSplashIcon = React.lazy(() => import('./signal-splash.svg'));
const CheckBoxFilledIcon = React.lazy(() => import('./checkbox-filled.svg'));
const NftIcon = React.lazy(() => import('./logo-nft.svg'));
const Logo = React.lazy(() => import('./subwallet-logo.svg'));
const LogoGradient = React.lazy(() => import('./subwallet-logo-gradient.svg'));
const MenuBarLogo = React.lazy(() => import('./menu-bar.svg'));
const IcHalfSquare = React.lazy(() => import('./ic-half-square.svg'));
const WalletConnect = React.lazy(() => import('./wallet-connect.svg'));

export const SVGImages = {
  Logo,
  LogoGradient,
  CheckBoxIcon,
  CheckBoxFilledIcon,
  NftIcon,
  SignalIcon,
  SignalSplashIcon,
  MenuBarLogo,
  IcHalfSquare,
  WalletConnect,
};

export const Images = {
  ...ImageLogosMap,
  loading: require('./loading.gif'),
  stackingEmptyList: require('./stacking-empty-list.png'),
  successStatusImg: require('./success-status.png'),
  failStatusImg: require('./fail-status.png'),
  backgroundImg: require('./subwallet-background-img.png'),
  historyEmpty: require('./transaction-history-coming-soon.png'),
  squircleBorder: require('./squircleBorder.png'),
  avatarPlaceholder: require('./avatar-placeholder.png'),
  browserBanner: require('./browser-banner.png'),
  circleRobot: require('./circle-robot.png'),
};
