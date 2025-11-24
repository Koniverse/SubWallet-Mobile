import React from 'react';
import { AccountType } from 'types/ui-types';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { StyleProp } from 'react-native';
import { ColorMap } from 'styles/color';
import { IconProps } from 'phosphor-react-native';
import { Logo as SWLogo } from 'components/design-system-ui';
import { AccountJson } from '@subwallet/extension-base/types';

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

export const isEmptyArray = (x: any) => !Array.isArray(x) || (Array.isArray(x) && x.length === 0);
export function toShort(text: string, preLength = 6, sufLength = 6): string {
  if (!sufLength && text.length > preLength) {
    return `${text.slice(0, preLength)}…`;
  }

  if (text.length > preLength + sufLength + 1) {
    return `${text.slice(0, preLength)}…${text.slice(-sufLength)}`;
  }

  return text;
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

export function getTokenGroupKey(token: string, isTestnet = false): string {
  return `${token.toLowerCase()}${isTestnet ? '|test' : ''}`;
}

export function getTokenBalanceKey(networkKey: string, token: string, isTestnet: boolean = false): string {
  return `${networkKey}|${token}${isTestnet ? '|test' : ''}`;
}

export function getAccountType(address: string): AccountType {
  return isAccountAll(address) ? 'ALL' : isEthereumAddress(address) ? 'ETHEREUM' : 'SUBSTRATE';
}

export function getLeftSelectItemIcon(icon: (iconProps: IconProps) => JSX.Element) {
  const Icon = icon;
  return <Icon size={20} color={ColorMap.disabled} weight={'bold'} />;
}

export function isUrl(targetString: string) {
  return targetString.startsWith('http:') || targetString.startsWith('https:') || targetString.startsWith('wss:');
}

export * from './account';
export * from './chain';
