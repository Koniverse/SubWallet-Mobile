import React, { Suspense } from 'react';
import { Images, SVGImages } from 'assets/index';
import { Recoded } from 'types/ui-types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { ChainRegistry, NetworkJson, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { KeypairType } from '@polkadot/util-crypto/types';
import { AccountJson, AccountWithChildren } from '@subwallet/extension-base/background/types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { decodeAddress, isEthereumAddress, ethereumEncode, encodeAddress } from '@polkadot/util-crypto';
import { Image, View } from 'react-native';
import { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { ColorMap } from 'styles/color';
import { BN, formatBalance } from '@polkadot/util';
import { BN_ZERO } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../types';

export const defaultRecoded: Recoded = { account: null, formatted: null, prefix: 42, isEthereum: false };
export const accountAllRecoded: Recoded = {
  account: {
    address: ALL_ACCOUNT_KEY,
  },
  formatted: ALL_ACCOUNT_KEY,
  prefix: 42,
  isEthereum: false,
};

export type TokenArrayType = {
  selectNetworkKey: string;
  tokenBalanceValue: BigN;
  convertedBalanceValue: BigN;
  tokenBalanceSymbol: string;
  defaultNetworkKey?: string;
};

export const subscanByNetworkKey: Record<string, string> = {
  acala: 'https://acala.subscan.io',
  // 'altair': 'https://altair.subscan.io',
  astar: 'https://astar.subscan.io',
  // 'basilisk': 'https://basilisk.subscan.io',
  bifrost: 'https://bifrost.subscan.io',
  calamari: 'https://calamari.subscan.io',
  centrifuge: 'https://centrifuge.subscan.io',
  clover: 'https://clover.subscan.io',
  // 'coinversation': 'https://coinversation.subscan.io',
  // 'composableFinance': 'https://composableFinance.subscan.io',
  crust: 'https://crust.subscan.io',
  darwinia: 'https://darwinia.subscan.io',
  edgeware: 'https://edgeware.subscan.io',
  // 'efinity': 'https://efinity.subscan.io/',
  equilibrium: 'https://equilibrium.subscan.io',
  // 'genshiro': 'https://genshiro.subscan.io',
  heiko: 'https://parallel-heiko.subscan.io',
  hydradx: 'https://hydradx.subscan.io',
  // 'interlay': 'https://interlay.subscan.io',
  karura: 'https://karura.subscan.io',
  khala: 'https://khala.subscan.io',
  kilt: 'https://spiritnet.subscan.io',
  kintsugi: 'https://kintsugi.subscan.io',
  kusama: 'https://kusama.subscan.io',
  // 'litentry': 'https://litentry.subscan.io',
  // 'manta': 'https://manta.subscan.io',
  // moonbeam: 'https://moonbeam.subscan.io',
  // moonriver: 'https://moonriver.subscan.io',
  // 'nodle': 'https://nodle.subscan.io',
  parallel: 'https://parallel.subscan.io',
  // 'phala': 'https://phala.subscan.io',
  picasso: 'https://picasso.subscan.io',
  pichiu: 'https://pichiu.subscan.io',
  // 'pioneer': 'https://pioneer.subscan.io',
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
  dolphin: 'https://dolphin.subscan.io/',
  encointer: 'https://encointer.subscan.io/',
  chainx: 'https://chainx.subscan.io/',
  litmus: 'https://litmus.subscan.io/',
};

export const moonbeamScanUrl = 'https://moonbeam.moonscan.io';

export const moonriverScanUrl = 'https://moonriver.moonscan.io';

export const moonbaseScanUrl = 'https://moonbase.moonscan.io';

export function isSupportSubscan(networkKey: string): boolean {
  return !!subscanByNetworkKey[networkKey];
}

export function isSupportScanExplorer(networkKey: string): boolean {
  return ['moonbeam', 'moonriver', 'moonbase'].includes(networkKey) || isSupportSubscan(networkKey);
}

export function getScanExplorerTransactionHistoryUrl(networkKey: string, hash: string): string {
  if (networkKey === 'moonbeam') {
    return `${moonbeamScanUrl}/tx/${hash}`;
  }

  if (networkKey === 'moonriver') {
    return `${moonriverScanUrl}/tx/${hash}`;
  }

  if (networkKey === 'moonbase') {
    return `${moonbaseScanUrl}/tx/${hash}`;
  }

  if (!subscanByNetworkKey[networkKey]) {
    return '';
  }

  return `${subscanByNetworkKey[networkKey]}/extrinsic/${hash}`;
}

export function getScanExplorerAddressInfoUrl(networkKey: string, address: string): string {
  if (networkKey === 'moonbeam') {
    return `${moonbeamScanUrl}/address/${address}`;
  }

  if (networkKey === 'moonriver') {
    return `${moonriverScanUrl}/address/${address}`;
  }

  if (networkKey === 'moonbase') {
    return `${moonbaseScanUrl}/address/${address}`;
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

export default function reformatAddress(address: string, networkPrefix: number, isEthereum = false): string {
  if (isAccountAll(address)) {
    return address;
  }

  if (isEthereumAddress(address)) {
    return address;
  }

  const publicKey = decodeAddress(address);

  if (isEthereum) {
    return ethereumEncode(publicKey);
  }

  if (networkPrefix < 0) {
    return address;
  }

  return encodeAddress(publicKey, networkPrefix);
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

// @ts-ignore
export function getNetworkLogo(networkKey: string, size: number, defaultLogo = 'default') {
  // @ts-ignore
  const imgSrc = Images[networkKey];

  if (imgSrc) {
    return (
      <Image
        style={{ width: size, height: size, borderRadius: size, backgroundColor: ColorMap.light }}
        source={imgSrc}
      />
    );
  }

  return getNetworkLogo(defaultLogo, size);
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function analysisAccounts(accounts: AccountJson[]): [boolean, boolean] {
  let substrateCounter = 0;
  let etherumCounter = 0;

  if (!accounts.length) {
    return [false, false];
  }

  accounts.forEach(a => {
    if (isAccountAll(a.address)) {
      return;
    }

    if (isEthereumAddress(a.address)) {
      etherumCounter++;
    } else {
      substrateCounter++;
    }
  });

  return [etherumCounter === 0 && substrateCounter > 0, etherumCounter > 0 && substrateCounter === 0];
}

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
    const [isContainOnlySubstrate, isContainOnlyEtherum] = analysisAccounts(accounts);

    if (isContainOnlySubstrate) {
      genesisOptions.forEach(o => {
        if (!o.isEthereum) {
          result.push(o);
        }
      });
    } else if (isContainOnlyEtherum) {
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

export function reformatBalance(value: string | BN, decimals: number, token: string): [string, string] {
  const si = formatBalance.calcSi(value.toString(), decimals);

  return [
    formatBalance(value, { decimals, forceUnit: si.value, withSi: false }),
    si.power === 0 ? token : `${si.text} ${token}`,
  ];
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

export function getSelectedTokenList(networkBalanceMaps: Record<string, BalanceInfo>) {
  let tokenArray: TokenArrayType[] = [];

  Object.keys(networkBalanceMaps).forEach(networkKey => {
    const networkBalanceInfo = networkBalanceMaps[networkKey];
    tokenArray.push({
      selectNetworkKey: networkKey,
      tokenBalanceValue: networkBalanceInfo.balanceValue,
      convertedBalanceValue: networkBalanceInfo.convertedBalanceValue,
      tokenBalanceSymbol: networkBalanceInfo.symbol,
    });

    if (networkBalanceInfo.childrenBalances && networkBalanceInfo.childrenBalances.length) {
      networkBalanceInfo.childrenBalances.forEach(children =>
        tokenArray.push({
          selectNetworkKey: children.key,
          tokenBalanceValue: children.balanceValue,
          convertedBalanceValue: children.convertedBalanceValue || BN_ZERO,
          tokenBalanceSymbol: children.symbol,
          defaultNetworkKey: networkKey,
        }),
      );
    }
  });

  return tokenArray;
}

export function getActiveToken(
  chainRegistryMap: Record<string, ChainRegistry>,
  networkMap: Record<string, NetworkJson>,
): TokenInfo[] {
  const options: TokenInfo[] = [];
  const activatedNetworks: string[] = [];

  Object.keys(networkMap).forEach(networkKey => {
    if (networkMap[networkKey].active) {
      activatedNetworks.push(networkKey);
    }
  });

  Object.keys(chainRegistryMap).forEach(networkKey => {
    if (!activatedNetworks.includes(networkKey)) {
      return;
    }

    Object.keys(chainRegistryMap[networkKey].tokenMap).forEach(token => {
      const tokenInfo = chainRegistryMap[networkKey].tokenMap[token];
      console.log('123123', chainRegistryMap[networkKey].tokenMap);

      options.push(tokenInfo);
    });
  });

  return options;
}
