// @ts-ignore
import CryptoLogo from './home-tab-icon/crypto.svg';
// @ts-ignore
import NFTLogo from './home-tab-icon/nfts.svg';
// @ts-ignore
import CrowndloanLogo from './home-tab-icon/crowdloans.svg';
// @ts-ignore
import StakingLogo from './home-tab-icon/staking.svg';
// @ts-ignore
import TransferLogo from './home-tab-icon/transfers.svg';
// @ts-ignore
import SubWalletLogo from './sub-wallet-logo.svg';
import SubWalletLogo2 from './logo-subwallet.svg';
// @ts-ignore
import AllAccountLogo from './all-account-icon.svg';
import ReceiveIcon from './receive-icon.svg';
import SendIcon from './send-icon.svg';
import SwapIcon from './swap-icon.svg';
import CloneIcon from './clone.svg';
import WarningIcon from './warning.svg';
import DangerIcon from './danger.svg';
import CheckBoxIcon from './checkbox.svg';
import CheckBoxFilledIcon from './checkbox-filled.svg';
import SuccessStatus from './success-status.svg';
import FailStatus from './fail-status.svg';
import { ImageLogosMap, SvgLogosMap } from 'assets/logo';

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
  ...SvgLogosMap,
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
  SuccessStatus,
  FailStatus,
};

export const Images = {
  ...ImageLogosMap,
  loading: require('./loading.gif'),
  stackingEmptyList: require('./stacking-empty-list.png'),
  loadingScreen: require('./loading-background.jpg'),
};
