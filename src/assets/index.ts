import React from 'react';
import { ImageLogosMap } from 'assets/logo';

const CheckBoxIcon = React.lazy(() => import('./checkbox.svg'));
const CheckBoxWithBorderIcon = React.lazy(() => import('./checkbox-with-border.svg'));
const SignalIcon = React.lazy(() => import('./signal.svg'));
const SignalSplashIcon = React.lazy(() => import('./signal-splash.svg'));
const CheckBoxFilledIcon = React.lazy(() => import('./checkbox-filled.svg'));
const NftIcon = React.lazy(() => import('./logo-nft.svg'));
const Logo = React.lazy(() => import('./subwallet-logo.svg'));
const SubwalletStyled = React.lazy(() => import('./subwallet-styled.svg'));
const MenuBarLogo = React.lazy(() => import('./menu-bar.svg'));
const IcHalfSquare = React.lazy(() => import('./ic-half-square.svg'));
const WalletConnect = React.lazy(() => import('./wallet-connect.svg'));
const TwitterLogo = React.lazy(() => import('./twitter-logo.svg'));
const SubWalletCircleLogo = React.lazy(() => import('./subwallet-circle.svg'));
const Fingerprint = React.lazy(() => import('./fingerprint-simple.svg'));

export const SVGImages = {
  Logo,
  SubwalletStyled,
  CheckBoxIcon,
  CheckBoxWithBorderIcon,
  CheckBoxFilledIcon,
  NftIcon,
  SignalIcon,
  SignalSplashIcon,
  MenuBarLogo,
  IcHalfSquare,
  WalletConnect,
  TwitterLogo,
  SubWalletCircleLogo,
  Fingerprint,
};

export const Images = {
  ...ImageLogosMap,
  SubWalletLogoGradient: require('./subwallet-logo-gradient.png'),
  swLogoLogin: require('./sw-logo-login.png'),
  backgroundImg: require('./subwallet-background-img.png'),
  historyEmpty: require('./transaction-history-coming-soon.png'),
  squircleBorder: require('./squircleBorder.png'),
  avatarPlaceholder: require('./avatar-placeholder.png'),
  circleRobot: require('./circle-robot.png'),
};
