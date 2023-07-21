import React, { Suspense } from 'react';
import { SVGImages } from 'assets/index';
import { AccountType, Recoded } from 'types/ui-types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import {
  ContractType,
  NETWORK_STATUS,
  NetWorkGroup,
  NetworkJson,
  TransakNetwork,
} from '@subwallet/extension-base/background/KoniTypes';
import { KeypairType } from '@polkadot/util-crypto/types';
import { AccountAuthType, AccountJson, AccountWithChildren } from '@subwallet/extension-base/background/types';
import { isAccountAll, uniqueStringArray } from '@subwallet/extension-base/utils';
import { decodeAddress, encodeAddress, ethereumEncode, isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { SiDef } from '@polkadot/util/types';
import BigN from 'bignumber.js';
import { BalanceInfo } from 'types/index';
import { BN_ZERO } from 'utils/chainBalances';
import { IconProps } from 'phosphor-react-native';
import { isValidURL } from 'utils/browser';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { Logo as SWLogo } from 'components/design-system-ui';
import { DEFAULT_ACCOUNT_TYPES, EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
export const PREDEFINED_TRANSAK_NETWORK: Record<string, TransakNetwork> = {
  polkadot: {
    networks: ['mainnet'],
    tokens: ['DOT'],
  },
  kusama: {
    networks: ['mainnet'],
    tokens: ['KSM'],
  },
  astar: {
    networks: ['astar'],
    tokens: ['ASTR'],
  },
  shiden: {
    networks: ['Shiden'],
    tokens: ['SDN'],
  },
  moonbeam: {
    networks: ['mainnet'],
    tokens: ['GLMR'],
  },
  moonriver: {
    networks: ['moonriver'],
    tokens: ['MOVR'],
  },
  ethereum: {
    networks: ['ethereum'],
    tokens: ['ETH'],
  },
  binance: {
    networks: ['bsc'],
    tokens: ['BNB'],
  },
};
export const defaultRecoded: Recoded = { account: null, formatted: null, prefix: 42, isEthereum: false };
export const accountAllRecoded: Recoded = {
  account: {
    address: ALL_ACCOUNT_KEY,
  },
  formatted: ALL_ACCOUNT_KEY,
  prefix: 42,
  isEthereum: false,
};

export interface NetworkSelectOption {
  text: string;
  value: string;
  networkKey: string;
  networkPrefix: number;
  icon: string;
  groups: NetWorkGroup[];
  isEthereum: boolean;
  active: boolean;
  apiStatus: NETWORK_STATUS;
}

export function getTokenNetworkKeyMap(): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  Object.entries({} as Record<string, _ChainInfo>).forEach(([networkKey, chainInfo]) => {
    try {
      let token = chainInfo.substrateInfo?.symbol || chainInfo.evmInfo?.symbol;

      if (!token) {
        return;
      }

      token = token.toLowerCase();

      const tgKey = getTokenGroupKey(token, chainInfo.isTestnet);

      if (!result[tgKey]) {
        result[tgKey] = [networkKey];
      } else {
        result[tgKey].push(networkKey);
      }
    } catch (e) {
      console.log(networkKey, chainInfo);
      return;
    }
  });

  return result;
}

// all keys must be lowercase
export const tokenNetworkKeyMap: Record<string, string[]> = Object.assign(getTokenNetworkKeyMap(), {
  intr: ['interlay'],
  'betadev|test': ['moonbase'],
  ibtc: ['interlay'],
});

export const subscanByNetworkKey: Record<string, string> = {
  acala: 'https://acala.subscan.io',
  // 'altair': 'https://altair.subscan.io',
  astar: 'https://astar.subscan.io',
  astarEvm: 'https://astar.subscan.io',
  // 'basilisk': 'https://basilisk.subscan.io',
  bifrost_dot: 'https://bifrost.subscan.io',
  bifrost: 'https://bifrost-kusama.subscan.io',
  calamari: 'https://calamari.subscan.io',
  centrifuge: 'https://centrifuge.subscan.io',
  clover: 'https://clover.subscan.io',
  // 'coinversation': 'https://coinversation.subscan.io',
  // 'composableFinance': 'https://composableFinance.subscan.io',
  crust: 'https://crust.subscan.io',
  darwinia: 'https://darwinia.subscan.io',
  edgeware: 'https://edgeware.subscan.io',
  // 'efinity': 'https://efinity.subscan.io',
  equilibrium: 'https://equilibrium.subscan.io',
  // 'genshiro': 'https://genshiro.subscan.io',
  heiko: 'https://parallel-heiko.subscan.io',
  hydradx: 'https://hydradx.subscan.io',
  // 'interlay': 'https://interlay.subscan.io',
  karura: 'https://karura.subscan.io',
  khala: 'https://khala.subscan.io',
  kilt: 'https://spiritnet.subscan.io',
  interlay: 'https://interlay.subscan.io',
  kintsugi: 'https://kintsugi.subscan.io',
  kusama: 'https://kusama.subscan.io',
  // 'litentry': 'https://litentry.subscan.io',
  // 'manta': 'https://manta.subscan.io',
  moonbeam: 'https://moonbeam.subscan.io',
  moonriver: 'https://moonriver.subscan.io',
  // 'nodle': 'https://nodle.subscan.io',
  parallel: 'https://parallel.subscan.io',
  // 'phala': 'https://phala.subscan.io',
  picasso: 'https://picasso.subscan.io',
  pichiu: 'https://pichiu.subscan.io',
  pioneer: 'https://pioneer.subscan.io',
  polkadot: 'https://polkadot.subscan.io',
  quartz: 'https://quartz.subscan.io',
  sakura: 'https://sakura.subscan.io',
  // 'shadow': 'https://shadow.subscan.io',
  shiden: 'https://shiden.subscan.io',
  sora: 'https://sora.subscan.io',
  statemine: 'https://statemine.subscan.io',
  subgame: 'https://subgame.subscan.io',
  statemint: 'https://statemint.subscan.io',
  // 'subsocial': 'https://subsocial.subscan.io',
  zeitgeist: 'https://zeitgeist.subscan.io',
  westend: 'https://westend.subscan.io',
  rococo: 'https://rococo.subscan.io',
  robonomics: 'https://robonomics.subscan.io',
  // moonbase: 'https://moonbase.subscan.io',
  dolphin: 'https://dolphin.subscan.io',
  encointer: 'https://encointer.subscan.io',
  chainx: 'https://chainx.subscan.io',
  litmus: 'https://litmus.subscan.io',
  crab: 'https://crab.subscan.io',
  mangatax_para: 'https://mangatax.subscan.io',
  mangatax: 'https://mangata-testnet.subscan.io',
  shibuya: 'https://shibuya.subscan.io',
  arctic_testnet: 'https://arctic.subscan.io',
  snow: 'https://snow.subscan.io',
  subspace_gemini_2a: 'https://subspace.subscan.io',
};

const evmBlockExplorer: Record<string, string> = {
  moonbeam: 'https://moonbeam.moonscan.io',
  moonriver: 'https://moonriver.moonscan.io',
  moonbase: 'https://moonbase.moonscan.io',
  ethereum: 'https://etherscan.io',
  ethereum_goerli: 'https://goerli.etherscan.io',
  binance: 'https://bscscan.com',
  binance_test: 'https://testnet.bscscan.com',
};

export function isSupportSubscan(networkKey: string): boolean {
  return !!subscanByNetworkKey[networkKey];
}

export function isSupportScanExplorer(networkKey: string): boolean {
  return Object.keys(evmBlockExplorer).includes(networkKey) || isSupportSubscan(networkKey);
}

export function getScanExplorerTransactionHistoryUrl(networkKey: string, hash: string, useSubscan?: boolean): string {
  if (useSubscan && subscanByNetworkKey[networkKey]) {
    return `${subscanByNetworkKey[networkKey]}/extrinsic/${hash}`;
  }

  if (Object.keys(evmBlockExplorer).indexOf(networkKey) > -1) {
    return `${evmBlockExplorer[networkKey]}/tx/${hash}`;
  }

  if (!subscanByNetworkKey[networkKey]) {
    return '';
  }

  return `${subscanByNetworkKey[networkKey]}/extrinsic/${hash}`;
}

export function getScanExplorerAddressInfoUrl(networkKey: string, address: string): string {
  if (Object.keys(evmBlockExplorer).indexOf(networkKey) > -1) {
    return `${evmBlockExplorer[networkKey]}/address/${address}`;
  }

  if (!subscanByNetworkKey[networkKey]) {
    return '';
  }

  return `${subscanByNetworkKey[networkKey]}/account/${address}`;
}

export const notDef = (x: any) => x === null || typeof x === 'undefined';
export const isDef = (x: any) => !notDef(x);
export const nonEmptyArr = (x: any) => Array.isArray(x) && x.length > 0;
export const isEmptyArray = (x: any) => !Array.isArray(x) || (Array.isArray(x) && x.length === 0);

export const getIcon = (iconName: string, size: number, color?: string, style?: object) => {
  // @ts-ignore
  const IconComponent = SVGImages[iconName];
  return (
    <Suspense fallback={<View style={{ width: size, height: size }} />}>
      <IconComponent width={size} height={size} color={color} style={style} />
    </Suspense>
  );
};

export function toShort(text: string, preLength = 6, sufLength = 6): string {
  if (!sufLength && text.length > preLength) {
    return `${text.slice(0, preLength)}…`;
  }

  if (text.length > preLength + sufLength + 1) {
    return `${text.slice(0, preLength)}…${text.slice(-sufLength)}`;
  }

  return text;
}

function findSubstrateAccount(accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return (
    accounts
      .filter(a => !isAccountAll(a.address))
      .find(({ address }): boolean => decodeAddress(address).toString() === pkStr) || null
  );
}

export function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | null {
  return accounts.find(({ address }): boolean => address === _address) || null;
}

export default function reformatAddress(address: string, networkPrefix = 42, isEthereum = false): string {
  if (!isAddress(address)) {
    return address;
  }

  if (isAccountAll(address)) {
    return address;
  }

  if (isEthereumAddress(address)) {
    return address;
  }

  try {
    const publicKey = decodeAddress(address);

    if (isEthereum) {
      return ethereumEncode(publicKey);
    }

    if (networkPrefix < 0) {
      return address;
    }

    return encodeAddress(publicKey, networkPrefix);
  } catch {
    return address;
  }
}

export function recodeAddress(
  address: string,
  accounts: AccountWithChildren[],
  networkInfo: NetworkJson | null,
  type?: KeypairType,
): Recoded {
  const publicKey = decodeAddress(address);
  const account = findAccountByAddress(accounts, address) || findSubstrateAccount(accounts, publicKey);
  const prefix = networkInfo ? networkInfo.ss58Format : 42;
  const isEthereum = type === 'ethereum' || !!networkInfo?.isEthereum;

  return {
    account,
    formatted: reformatAddress(address, prefix, isEthereum),
    genesisHash: account?.genesisHash,
    prefix,
    isEthereum,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getNetworkLogo(logoKey: string, size: number, defaultLogoKey = 'default', outerStyle?: StyleProp<any>) {
  return <SWLogo network={logoKey} defaultLogoKey={defaultLogoKey} size={size} />;
}
export function getTokenLogo(
  logoKey: string,
  subLogoKey: string | undefined,
  size: number,
  defaultLogoKey = 'default',
) {
  return (
    <SWLogo
      token={logoKey.toLowerCase()}
      subNetwork={subLogoKey}
      defaultLogoKey={defaultLogoKey}
      size={size}
      isShowSubLogo={!!subLogoKey}
    />
  );
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function analysisAccounts(accounts: AccountJson[]): [boolean, boolean] {
  let substrateCounter = 0;
  let ethereumCounter = 0;

  if (!accounts.length) {
    return [false, false];
  }

  accounts.forEach(a => {
    if (isAccountAll(a.address)) {
      return;
    }

    if (isEthereumAddress(a.address)) {
      ethereumCounter++;
    } else {
      substrateCounter++;
    }
  });

  return [ethereumCounter === 0 && substrateCounter > 0, ethereumCounter > 0 && substrateCounter === 0];
}

export function getSortedNetworkKeys(networkKeys: string[]) {
  return networkKeys.sort((a, b) => {
    if (b === 'polkadot') {
      return 1;
    }

    if (b === 'kusama' && a !== 'polkadot') {
      return 1;
    }

    if (b === 'westend' && a !== 'kusama') {
      return 1;
    }

    if (b === 'rococo' && a !== 'westend') {
      return 1;
    }

    if (a === 'polkadot') {
      return -1;
    }

    if (a === 'kusama' && b !== 'polkadot') {
      return -1;
    }

    if (a === 'westend' && b !== 'kusama') {
      return -1;
    }

    if (a === 'rococo' && b !== 'westend') {
      return -1;
    }

    return a.localeCompare(b);
  });
}

export function getNetworkKeysByAddressType(
  addressType: AccountType | undefined,
  accounts: AccountJson[],
  networkMap: Record<string, NetworkJson>,
  activatedNetworkOnly: boolean = true,
): string[] {
  if (!addressType || !accounts.length) {
    return [];
  }

  const networkMapKeys = getSortedNetworkKeys(Object.keys(networkMap));

  const result: string[] = [];

  if (addressType === 'ALL') {
    const [isContainOnlySubstrate, isContainOnlyEthereum] = analysisAccounts(accounts);

    networkMapKeys.forEach(nk => {
      const networkJson = networkMap[nk];

      if (activatedNetworkOnly && !networkJson.active) {
        return;
      }

      if (isContainOnlySubstrate) {
        if (!networkJson.isEthereum) {
          result.push(nk);
        }
      } else if (isContainOnlyEthereum) {
        if (networkJson.isEthereum) {
          result.push(nk);
        }
      } else {
        result.push(nk);
      }
    });
  } else if (addressType === 'ETHEREUM') {
    networkMapKeys.forEach(nk => {
      const networkJson = networkMap[nk];

      if (activatedNetworkOnly && !networkJson.active) {
        return;
      }

      if (networkJson.isEthereum) {
        result.push(nk);
      }
    });
  } else {
    networkMapKeys.forEach(nk => {
      const networkJson = networkMap[nk];

      if (activatedNetworkOnly && !networkJson.active) {
        return;
      }

      if (!networkJson.isEthereum) {
        result.push(nk);
      }
    });
  }

  return result;
}

// @Deprecated
export function getGenesisOptionsByAddressType(
  address: string | null | undefined,
  accounts: AccountJson[],
  genesisOptions: NetworkSelectOption[],
): NetworkSelectOption[] {
  if (!address || !accounts.length) {
    return genesisOptions.filter(o => !o.isEthereum);
  }

  const result: NetworkSelectOption[] = [];

  if (isAccountAll(address)) {
    const [isContainOnlySubstrate, isContainOnlyEthereum] = analysisAccounts(accounts);

    if (isContainOnlySubstrate) {
      genesisOptions.forEach(o => {
        if (!o.isEthereum) {
          result.push(o);
        }
      });
    } else if (isContainOnlyEthereum) {
      genesisOptions.forEach(o => {
        if (o.isEthereum || o.networkKey === 'all') {
          result.push(o);
        }
      });
    } else {
      return genesisOptions;
    }
  } else if (address.startsWith('0x')) {
    genesisOptions.forEach(o => {
      if (o.isEthereum || o.networkKey === 'all') {
        result.push(o);
      }
    });
  } else {
    genesisOptions.forEach(o => {
      if (!o.isEthereum) {
        result.push(o);
      }
    });
  }

  return result;
}

export function getBalanceWithSi(value: string, decimals: number, si: SiDef, token: string): [string, string] {
  let valueBigN = new BigN(!isNaN(parseFloat(value)) ? value : '0');
  valueBigN = valueBigN.div(new BigN(10).pow(decimals + si.power));
  return [valueBigN.toFixed(), si.power === 0 ? token : `${si.text} ${token}`];
}

export function getEthereumChains(networkMap: Record<string, NetworkJson>): string[] {
  const result: string[] = [];

  Object.keys(networkMap).forEach(k => {
    if (networkMap[k].isEthereum) {
      result.push(k);
    }
  });

  return result;
}

export function getTokenGroupKey(token: string, isTestnet = false): string {
  return `${token.toLowerCase()}${isTestnet ? '|test' : ''}`;
}

export function getTokenBalanceKey(networkKey: string, token: string, isTestnet: boolean = false): string {
  return `${networkKey}|${token}${isTestnet ? '|test' : ''}`;
}

// export function getActiveToken(
//   chainRegistryMap: Record<string, ChainRegistry>,
//   networkMap: Record<string, NetworkJson>,
// ): TokenInfo[] {
//   const options: TokenInfo[] = [];
//   const activatedNetworks: string[] = [];
//
//   Object.keys(networkMap).forEach(networkKey => {
//     if (networkMap[networkKey].active) {
//       activatedNetworks.push(networkKey);
//     }
//   });
//
//   Object.keys(chainRegistryMap).forEach(networkKey => {
//     if (!activatedNetworks.includes(networkKey)) {
//       return;
//     }
//
//     Object.keys(chainRegistryMap[networkKey].tokenMap).forEach(token => {
//       const tokenInfo = chainRegistryMap[networkKey].tokenMap[token];
//
//       options.push(tokenInfo);
//     });
//   });
//
//   return options;
// }

export function getAccountType(address: string): AccountType {
  return isAccountAll(address) ? 'ALL' : isEthereumAddress(address) ? 'ETHEREUM' : 'SUBSTRATE';
}

export function getTotalConvertedBalanceValue(balanceInfo?: BalanceInfo): BigN {
  if (!balanceInfo) {
    return BN_ZERO;
  }

  let result = new BigN(balanceInfo.convertedBalanceValue);

  if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
    balanceInfo.childrenBalances.forEach(i => {
      result = result.plus(i.convertedBalanceValue);
    });
  }

  return result;
}

export function hasAnyChildTokenBalance(balanceInfo: BalanceInfo): boolean {
  if (!balanceInfo.childrenBalances || !balanceInfo.childrenBalances.length) {
    return false;
  }

  for (const item of balanceInfo.childrenBalances) {
    if (item.balanceValue.gt(BN_ZERO)) {
      return true;
    }
  }

  return false;
}

export function getRoundedDecimalNumber(numberString: string, digits: number = 2): string {
  const number = isNaN(parseFloat(numberString)) ? '0' : numberString;

  return (+(Math.round(+(number + `e+${digits}`)) + `e-${digits}`)).toString();
}

export function getLeftSelectItemIcon(icon: (iconProps: IconProps) => JSX.Element) {
  const Icon = icon;
  return <Icon size={20} color={ColorMap.disabled} weight={'bold'} />;
}

export const getNetworkJsonByGenesisHash = (
  networkMap: Record<string, NetworkJson>,
  hash: string,
): NetworkJson | null => {
  for (const n in networkMap) {
    if (!Object.prototype.hasOwnProperty.call(networkMap, n)) {
      continue;
    }

    const networkInfo = networkMap[n];

    if (networkInfo.genesisHash === hash) {
      return networkInfo;
    }
  }

  return null;
};

export const isValidProvider = (provider: string) => {
  if (isValidURL(provider)) {
    return true;
  } else if (provider.startsWith('wss://') || provider.startsWith('light://')) {
    return true;
  }

  return false;
};

export function isNftTransferSupported(networkKey: string, networkJson: NetworkJson) {
  if (networkJson.isEthereum) {
    return true;
  }

  if (
    !networkJson.isEthereum &&
    networkJson.supportSmartContract &&
    networkJson.supportSmartContract.includes(ContractType.wasm)
  ) {
    return true;
  }

  return SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.includes(networkKey);
}

export function isUrl(targetString: string) {
  return targetString.startsWith('http:') || targetString.startsWith('https:') || targetString.startsWith('wss:');
}

export const convertKeyTypes = (authTypes: AccountAuthType[]): KeypairType[] => {
  const result: KeypairType[] = [];

  for (const authType of authTypes) {
    if (authType === 'evm') {
      result.push(EVM_ACCOUNT_TYPE);
    } else if (authType === 'substrate') {
      result.push(SUBSTRATE_ACCOUNT_TYPE);
    } else if (authType === 'both') {
      result.push(SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE);
    }
  }

  const _rs = uniqueStringArray(result) as KeypairType[];

  return _rs.length ? _rs : DEFAULT_ACCOUNT_TYPES;
};
