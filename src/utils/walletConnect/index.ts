import { _ChainInfo } from '@subwallet/chain-list/types';
import { AbstractAddressJson, AccountJson } from '@subwallet/extension-base/background/types';
import {
  findChainInfoByChainId,
  findChainInfoByHalfGenesisHash,
} from '@subwallet/extension-base/services/chain-service/utils';
import {
  WALLET_CONNECT_EIP155_NAMESPACE,
  WALLET_CONNECT_POLKADOT_NAMESPACE,
} from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { SessionTypes } from '@walletconnect/types';

import { findAccountByAddress } from '../account';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { addConnection } from 'messaging/index';
import { ToastType } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

export const chainsToWalletConnectChainInfos = (
  chainMap: Record<string, _ChainInfo>,
  chains: string[],
): Array<WalletConnectChainInfo> => {
  return chains.map(chain => {
    const [namespace, info] = chain.split(':');

    if (namespace === WALLET_CONNECT_EIP155_NAMESPACE) {
      const chainInfo = findChainInfoByChainId(chainMap, parseInt(info));

      return {
        chainInfo,
        slug: chainInfo?.slug || chain,
        supported: !!chainInfo,
      };
    } else if (namespace === WALLET_CONNECT_POLKADOT_NAMESPACE) {
      const chainInfo = findChainInfoByHalfGenesisHash(chainMap, info);

      return {
        chainInfo,
        slug: chainInfo?.slug || chain,
        supported: !!chainInfo,
      };
    } else {
      return {
        chainInfo: null,
        slug: chain,
        supported: false,
      };
    }
  });
};

export const getWCAccountList = (
  accounts: AccountJson[],
  namespaces: SessionTypes.Namespaces,
): AbstractAddressJson[] => {
  const rawMap: Record<string, string> = {};
  const rawList = Object.values(namespaces)
    .map(namespace => namespace.accounts || [])
    .flat();

  rawList.forEach(info => {
    const [, , address] = info.split(':');

    rawMap[address] = address;
  });

  const convertMap: Record<string, AbstractAddressJson> = {};
  const convertList = Object.keys(rawMap).map((address): AbstractAddressJson | null => {
    const account = findAccountByAddress(accounts, address);

    if (account) {
      return {
        address: account.address,
        name: account.name,
      };
    } else {
      return null;
    }
  });

  convertList.forEach(info => {
    if (info) {
      convertMap[info.address] = info;
    }
  });

  return Object.values(convertMap);
};

export const isValidUri = (uri: string) => {
  return !validWalletConnectUri(uri);
};

const runned: Record<string, boolean> = {};

export const connectWalletConnect = (wcUrl: string, toast?: ToastType) => {
  if (isValidUri(wcUrl)) {
    if (!runned[wcUrl]) {
      runned[wcUrl] = true;
      addConnection({ uri: wcUrl }).catch(e => {
        const errMessage = (e as Error).message;
        console.log('e----------', errMessage);
        const message = errMessage.includes('Pairing already exists')
          ? i18n.errorMessage.connectionAlreadyExist
          : i18n.errorMessage.failToAddConnection;
        toast?.show(message, { type: 'danger' });
      });
    }
  } else {
    toast?.show('Invalid uri');
  }
};
