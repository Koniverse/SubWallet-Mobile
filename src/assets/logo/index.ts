// Note: All keys must be lowercase

import React from 'react';

const EnglishLogo = React.lazy(() => import('./english.svg'));
const VietnameseLogo = React.lazy(() => import('./vietnamese.svg'));
const ChineseLogo = React.lazy(() => import('./chinese.svg'));
const FranchiseLogo = React.lazy(() => import('./franchise.svg'));
const JapaneseLogo = React.lazy(() => import('./japan.svg'));
const RussianLogo = React.lazy(() => import('./russia.svg'));
const XLogo = React.lazy(() => import('./x-logo.svg'));
const RestartLogo = React.lazy(() => import('./restart-logo.svg'));

export const ImageLogosMap = {
  parity: require('./207.vault.png'),
  keystone: require('./202.keystone.png'),
  subwallet: require('./00.subwallet.png'),
  __qr_code__: require('./203.__qr_code__.png'),
  transak: require('./transak.png'),
  moonpay: require('./moonpay.png'),
  onramper: require('./onramper.png'),
  default: require('./default.png'),
  banxa: require('./banxa.png'),
  coinbase: require('./coinbase.png'),
  stellaswap: require('./stellaswap.png'),
  chain_flip_mainnet: require('./chainflip-mainnet.png'),
  chain_flip_testnet: require('./chainflip-mainnet.png'),
  hydradx_mainnet: require('./hydradx_main.png'),
  hydradx_testnet: require('./hydradx_main.png'),
  simple_swap: require('./simple-swap.png'),
  currency_brl: require('./CurrencyBRL.png'),
  currency_cny: require('./CurrencyCNY.png'),
  currency_hkd: require('./CurrencyHKD.png'),
  currency_vnd: require('./CurrencyVND.png'),
  polkadot_assethub: require('./polkadot-asset-hub.png'),
  kusama_assethub: require('./kusama-asset-hub.png'),
  rococo_assethub: require('./uniswap.png'),
  uniswap: require('./rococo-asset-hub.png'),
  en: EnglishLogo,
  vi: VietnameseLogo,
  chi: ChineseLogo,
  fr: FranchiseLogo,
  ja: JapaneseLogo,
  ru: RussianLogo,
  XLogo: XLogo,
  RestartLogo: RestartLogo,
};
