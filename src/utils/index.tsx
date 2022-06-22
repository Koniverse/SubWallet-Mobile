import React from 'react';
import { Images, SVGImages } from 'assets/index';
import { Recoded } from 'types/ui-types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { KeypairType } from '@polkadot/util-crypto/types';
import { AccountJson, AccountWithChildren } from '@subwallet/extension-base/background/types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { decodeAddress, isEthereumAddress, ethereumEncode, encodeAddress } from '@polkadot/util-crypto';
import { SvgLogosMap } from 'assets/logo';
import { Image } from 'react-native';
import { NetworkSelectOption } from 'hooks/useGenesisHashOptions';
import { ColorMap } from 'styles/color';

export const defaultRecoded: Recoded = { account: null, formatted: null, prefix: 42, isEthereum: false };
export const accountAllRecoded: Recoded = {
  account: {
    address: ALL_ACCOUNT_KEY,
  },
  formatted: ALL_ACCOUNT_KEY,
  prefix: 42,
  isEthereum: false,
};

export const notDef = (x: any) => x === null || typeof x === 'undefined';
export const isDef = (x: any) => !notDef(x);
export const nonEmptyArr = (x: any) => Array.isArray(x) && x.length > 0;
export const isEmptyArray = (x: any) => !Array.isArray(x) || (Array.isArray(x) && x.length === 0);

export const getIcon = (iconName: string, size: number, color?: string, style?: object) => {
  // @ts-ignore
  const IconComponent = SVGImages[iconName];
  return <IconComponent width={size} height={size} color={color} style={style} />;
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

export function getNetworkLogo(networkKey: string, size: number, defaultLogo = 'default') {
  // @ts-ignore
  if (SvgLogosMap[networkKey]) {
    const style = {
      borderRadius: size / 2,
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    };

    const styleWithBgc = {
      ...style,
      backgroundColor: ColorMap.light,
    };

    if (networkKey === 'interlay') {
      return getIcon(networkKey, size, '#FFF', styleWithBgc);
    }

    return getIcon(networkKey, size, '#FFF', style);
  } else if (Images[networkKey]) {
    return (
      <Image
        style={{ width: size, height: size, borderRadius: size, backgroundColor: '#FFF' }}
        source={Images[networkKey]}
      />
    );
  }

  return getIcon(defaultLogo, size);
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
    const [isContainOnlySubstrate, isContainOnlyEtherum] = [false, true];

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
