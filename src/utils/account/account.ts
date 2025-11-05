import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { AbstractAddressJson, AccountChainType, AccountJson, AccountSignMode } from '@subwallet/extension-base/types';
import { isAddress, isSubstrateAddress, isTonAddress } from '@subwallet/keyring';
import { KeypairType } from '@subwallet/keyring/types';
import { BitcoinAccountInfo } from 'types/account';
import { isAccountAll, reformatAddress, uniqueStringArray } from '@subwallet/extension-base/utils';
import { MODE_CAN_SIGN } from 'constants/signer';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainInfoCompatibleWithAccountInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { DEFAULT_ACCOUNT_TYPES, EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE, TON_ACCOUNT_TYPE } from 'constants/index';

export const isAddressAllowedWithAuthType = (address: string, authAccountTypes?: AccountAuthType[]) => {
  if (isEthereumAddress(address) && authAccountTypes?.includes('evm')) {
    return true;
  }

  if (isSubstrateAddress(address) && authAccountTypes?.includes('substrate')) {
    return true;
  }

  if (isTonAddress(address) && authAccountTypes?.includes('ton')) {
    return true;
  }

  return false;
};

export function getChainTypeLogoMap(): Record<string, string> {
  return {
    [AccountChainType.SUBSTRATE]: 'polkadot',
    [AccountChainType.ETHEREUM]: 'ethereum',
    [AccountChainType.BITCOIN]: 'bitcoin',
    [AccountChainType.TON]: 'ton',
    [AccountChainType.CARDANO]: 'cardano',
  };
}

export const findAccountByAddress = (accounts: AccountJson[], address?: string): AccountJson | null => {
  try {
    const isAllAccount = address && isAccountAll(address);
    if (!isAddress(address) && !isAllAccount) {
      return null;
    }

    const originAddress = isAccountAll(address) ? address : reformatAddress(address);
    const result = accounts.find(account => account.address.toLowerCase() === originAddress.toLowerCase());

    return result || null;
  } catch (e) {
    console.error('Fail to detect address', e);

    return null;
  }
};

export const accountCanSign = (signMode: AccountSignMode): boolean => {
  return MODE_CAN_SIGN.includes(signMode);
};

export const getSignMode = (account: AccountJson | null | undefined): AccountSignMode => {
  if (!account) {
    return AccountSignMode.UNKNOWN;
  } else {
    if (account.address === ALL_ACCOUNT_KEY) {
      return AccountSignMode.ALL_ACCOUNT;
    } else {
      if (account.isExternal) {
        if (account.isHardware) {
          if (account.isGeneric) {
            return AccountSignMode.GENERIC_LEDGER;
          } else {
            return AccountSignMode.LEGACY_LEDGER;
          }
        } else if (account.isReadOnly) {
          return AccountSignMode.READ_ONLY;
        } else {
          return AccountSignMode.QR;
        }
      } else {
        return AccountSignMode.PASSWORD;
      }
    }
  }
};

export const isNoAccount = (accounts: AccountJson[] | null): boolean => {
  return accounts ? !accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY).length : false;
};

export const funcSortByName = (a: AbstractAddressJson, b: AbstractAddressJson) => {
  if (isAccountAll(b.address)) {
    return 3;
  }

  return (a?.name || '').toLowerCase() > (b?.name || '').toLowerCase() ? 1 : -1;
};

export const findContactByAddress = (contacts: AbstractAddressJson[], address?: string): AbstractAddressJson | null => {
  try {
    const isAllAccount = address && isAccountAll(address);
    if (!isAddress(address) && !isAllAccount) {
      return null;
    }

    const originAddress = isAccountAll(address) ? address : reformatAddress(address);
    const result = contacts.find(contact => contact.address.toLowerCase() === originAddress.toLowerCase());

    return result || null;
  } catch (e) {
    console.error(`Fail to detect address ${address}`, e);

    return null;
  }
};

export const convertKeyTypes = (authTypes: AccountAuthType[]): KeypairType[] => {
  const result: KeypairType[] = [];

  for (const authType of authTypes) {
    if (authType === 'evm') {
      result.push(EVM_ACCOUNT_TYPE);
    } else if (authType === 'substrate') {
      result.push(SUBSTRATE_ACCOUNT_TYPE);
    } else if (authType === 'ton') {
      result.push(TON_ACCOUNT_TYPE);
    }
  }

  const _rs = uniqueStringArray(result) as KeypairType[];

  return _rs.length ? _rs : DEFAULT_ACCOUNT_TYPES;
};

export function getReformatedAddressRelatedToChain(
  accountJson: AccountJson,
  chainInfo: _ChainInfo,
): string | undefined {
  if (accountJson.specialChain && accountJson.specialChain !== chainInfo.slug) {
    return undefined;
  }

  if (!_isChainInfoCompatibleWithAccountInfo(chainInfo, accountJson)) {
    return undefined;
  }

  if (accountJson.chainType === AccountChainType.SUBSTRATE && chainInfo.substrateInfo) {
    return reformatAddress(accountJson.address, chainInfo.substrateInfo.addressPrefix);
  } else if (accountJson.chainType === AccountChainType.ETHEREUM && chainInfo.evmInfo) {
    return accountJson.address;
  } else if (accountJson.chainType === AccountChainType.TON && chainInfo.tonInfo) {
    return reformatAddress(accountJson.address, chainInfo.isTestnet ? 0 : 1);
  } else if (accountJson.chainType === AccountChainType.CARDANO && chainInfo.cardanoInfo) {
    return reformatAddress(accountJson.address, chainInfo.isTestnet ? 0 : 1);
  } else if (accountJson.chainType === AccountChainType.BITCOIN && chainInfo.bitcoinInfo) {
    return accountJson.address;
  }

  return undefined;
}

export function getBitcoinAccountDetails(type: KeypairType): BitcoinAccountInfo {
  const result: BitcoinAccountInfo = {
    name: 'Unknown',
    network: 'Unknown',
    order: 99,
  };

  switch (type) {
    case 'bitcoin-84':
      result.logoKey = 'bitcoin';
      result.name = 'Native SegWit';
      result.network = 'Bitcoin';
      result.order = 1;
      break;

    case 'bittest-84':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Native SegWit';
      result.network = 'Bitcoin Testnet';
      result.order = 2;
      break;

    case 'bitcoin-86':
      result.logoKey = 'bitcoin';
      result.name = 'Taproot';
      result.network = 'Bitcoin';
      result.order = 3;
      break;

    case 'bittest-86':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Taproot';
      result.network = 'Bitcoin Testnet';
      result.order = 4;
      break;

    case 'bitcoin-44':
      result.logoKey = 'bitcoin';
      result.name = 'Legacy';
      result.network = 'Bitcoin';
      result.order = 5;
      break;

    case 'bittest-44':
      result.logoKey = 'bitcoinTestnet';
      result.name = 'Legacy';
      result.network = 'Bitcoin Testnet';
      result.order = 6;
      break;
  }

  return result;
}

export const getBitcoinKeypairAttributes = (keyPairType: KeypairType): { label: string; schema: string } => {
  switch (keyPairType) {
    case 'bitcoin-44':
    case 'bittest-44':
      return { label: 'Legacy', schema: 'orange-7' };
    case 'bitcoin-86':
    case 'bittest-86':
      return { label: 'Taproot', schema: 'cyan-7' };
    case 'bitcoin-84':
    case 'bittest-84':
      return { label: 'Native SegWit', schema: 'lime-7' };
    default:
      return { label: '', schema: '' };
  }
};
