// Note: All keys must be lowercase

import React from 'react';

const EnglishLogo = React.lazy(() => import('./languages/english.svg'));
const VietnameseLogo = React.lazy(() => import('./languages/vietnamese.svg'));
const ChineseLogo = React.lazy(() => import('./languages/chinese.svg'));
const FranchiseLogo = React.lazy(() => import('./languages/franchise.svg'));
const JapaneseLogo = React.lazy(() => import('./languages/japan.svg'));
const RussianLogo = React.lazy(() => import('./languages/russia.svg'));
const XLogo = React.lazy(() => import('./x-logo.svg'));
const RestartLogo = React.lazy(() => import('./restart-logo.svg'));

export const ImageLogosMap = {
  parity: require('./207.vault.png'),
  keystone: require('./202.keystone.png'),
  subwallet: require('./00.subwallet.png'),
  __qr_code__: require('./203.__qr_code__.png'),
  transak: require('./buy/transak.png'),
  moonpay: require('./buy/moonpay.png'),
  onramper: require('./buy/onramper.png'),
  banxa: require('./buy/banxa.png'),
  coinbase: require('./buy/coinbase.png'),
  meld: require('./buy/meld.png'),
  default: require('./default.png'),
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
  ordinal_rune: require('./ordinal_rune.png'),
  kyber: require('./kyber.png'),
  tanssi: require('./tanssi.png'),
  en: EnglishLogo,
  vi: VietnameseLogo,
  chi: ChineseLogo,
  fr: FranchiseLogo,
  ja: JapaneseLogo,
  ru: RussianLogo,
  XLogo: XLogo,
  RestartLogo: RestartLogo,
};
