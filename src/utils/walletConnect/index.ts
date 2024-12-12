import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  findChainInfoByChainId,
  findChainInfoByHalfGenesisHash,
} from '@subwallet/extension-base/services/chain-service/utils';
import {
  WALLET_CONNECT_EIP155_NAMESPACE,
  WALLET_CONNECT_POLKADOT_NAMESPACE,
} from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { SessionTypes } from '@walletconnect/types';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { addConnection } from 'messaging/index';
import { ToastType } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import { AccountProxy } from '@subwallet/extension-base/types';

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

export const getWCAccountProxyList = (
  accountProxies: AccountProxy[],
  namespaces: SessionTypes.Namespaces,
): AccountProxy[] => {
  const filteredList: string[] = [];
  const rawList = Object.values(namespaces)
    .map(namespace => namespace.accounts || [])
    .flat();

  rawList.forEach(info => {
    const [, , address] = info.split(':');

    if (!filteredList.includes(address)) {
      filteredList.push(address);
    }
  });

  return accountProxies.filter(({ accounts }) => {
    return accounts.some(({ address }) => filteredList.includes(address));
  });
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
