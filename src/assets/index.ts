import React from 'react';
import { ImageLogosMap } from 'assets/logo';

const CryptoLogo = React.lazy(() => import('./home-tab-icon/crypto.svg'));
const NFTLogo = React.lazy(() => import('./home-tab-icon/nfts.svg'));
const CrowndloanLogo = React.lazy(() => import('./home-tab-icon/crowdloans.svg'));
const StakingLogo = React.lazy(() => import('./home-tab-icon/staking.svg'));
const TransferLogo = React.lazy(() => import('./home-tab-icon/transfers.svg'));
const SubWalletLogo = React.lazy(() => import('./sub-wallet-logo.svg'));
const SubWalletLogo2 = React.lazy(() => import('./logo-subwallet.svg'));
const AllAccountLogo = React.lazy(() => import('./all-account-icon.svg'));
const ReceiveIcon = React.lazy(() => import('./receive-icon.svg'));
const SendIcon = React.lazy(() => import('./send-icon.svg'));
const SwapIcon = React.lazy(() => import('./swap-icon.svg'));
const CloneIcon = React.lazy(() => import('./clone.svg'));
const WarningIcon = React.lazy(() => import('./warning.svg'));
const DangerIcon = React.lazy(() => import('./danger.svg'));
const CheckBoxIcon = React.lazy(() => import('./checkbox.svg'));
const CheckBoxFilledIcon = React.lazy(() => import('./checkbox-filled.svg'));

export const HomeTabIcon = {
  crypto: CryptoLogo,
  nft: NFTLogo,
  crowdloan: CrowndloanLogo,
  staking: StakingLogo,
  transfer: TransferLogo,
};

export const Logo = {
  SubWallet: SubWalletLogo,
  AllAccount: AllAccountLogo,
};

export const SVGImages = {
  HomeTabIcon,
  Logo,
  ReceiveIcon: ReceiveIcon,
  SendIcon: SendIcon,
  SwapIcon: SwapIcon,
  CloneIcon: CloneIcon,
  WarningIcon: WarningIcon,
  DangerIcon: DangerIcon,
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
