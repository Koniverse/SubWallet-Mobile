import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { isAccountAll } from 'utils/accountAll';
import { RootState } from 'stores/index';
import { AccountAuthType, AccountJson } from '@subwallet/extension-base/background/types';
import { WalletConnectChainInfo } from 'types/walletConnect';
import {
  isProposalExpired,
  isSupportWalletConnectChain,
  isSupportWalletConnectNamespace,
} from '@subwallet/extension-base/services/wallet-connect-service/helpers';
import { isSameAddress, uniqueStringArray } from '@subwallet/extension-base/utils';
import {
  WALLET_CONNECT_EIP155_NAMESPACE,
  WALLET_CONNECT_SUPPORT_NAMESPACES,
} from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { isEthereumAddress } from '@polkadot/util-crypto';
import reformatAddress from 'utils/index';
import { ProposalTypes } from '@walletconnect/types';
import { chainsToWalletConnectChainInfos } from 'utils/walletConnect';

interface SelectAccount {
  availableAccounts: AccountJson[];
  networks: WalletConnectChainInfo[];
  selectedAccounts: string[];
  appliedAccounts: string[];
}

const useSelectWalletConnectAccount = (params: ProposalTypes.Struct) => {
  const [result, setResult] = useState<Record<string, SelectAccount>>({});

  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const noAllAccount = useMemo(() => accounts.filter(({ address }) => !isAccountAll(address)), [accounts]);

  const namespaces: Record<string, WalletConnectChainInfo[]> = useMemo(() => {
    const availableNamespaces: Record<string, string[]> = {};
    const _result: Record<string, WalletConnectChainInfo[]> = {};

    Object.entries(params.requiredNamespaces).forEach(([key, namespace]) => {
      if (isSupportWalletConnectNamespace(key)) {
        if (namespace.chains) {
          availableNamespaces[key] = namespace.chains;
        }
      }
    });

    Object.entries(params.optionalNamespaces).forEach(([key, namespace]) => {
      if (isSupportWalletConnectNamespace(key)) {
        if (namespace.chains) {
          const requiredNameSpace = availableNamespaces[key];
          const defaultChains: string[] = [];

          if (requiredNameSpace) {
            availableNamespaces[key] = [
              ...(requiredNameSpace || defaultChains),
              ...(namespace.chains || defaultChains),
            ];
          } else {
            if (namespace.chains.length) {
              availableNamespaces[key] = namespace.chains;
            }
          }
        }
      }
    });

    for (const [namespace, chains] of Object.entries(availableNamespaces)) {
      _result[namespace] = chainsToWalletConnectChainInfos(chainInfoMap, uniqueStringArray(chains));
    }

    return _result;
  }, [chainInfoMap, params.optionalNamespaces, params.requiredNamespaces]);

  const supportedChains = useMemo(() => {
    const chains: string[] = [];

    for (const [key, namespace] of Object.entries(params.requiredNamespaces)) {
      if (isSupportWalletConnectNamespace(key)) {
        chains.push(...(namespace.chains || []));
      }
    }

    for (const [key, namespace] of Object.entries(params.optionalNamespaces)) {
      if (isSupportWalletConnectNamespace(key)) {
        chains.push(...(namespace.chains || []));
      }
    }

    return chainsToWalletConnectChainInfos(chainInfoMap, uniqueStringArray(chains)).filter(
      ({ supported }) => supported,
    );
  }, [chainInfoMap, params.optionalNamespaces, params.requiredNamespaces]);

  const missingType = useMemo((): AccountAuthType[] => {
    const _result: AccountAuthType[] = [];

    Object.keys(params.requiredNamespaces).forEach(namespace => {
      if (WALLET_CONNECT_SUPPORT_NAMESPACES.includes(namespace)) {
        const available = noAllAccount.some(
          acc => (WALLET_CONNECT_EIP155_NAMESPACE === namespace) === isEthereumAddress(acc.address),
        );

        if (!available) {
          _result.push(WALLET_CONNECT_EIP155_NAMESPACE === namespace ? 'evm' : 'substrate');
        }
      }
    });

    return _result;
  }, [noAllAccount, params.requiredNamespaces]);

  const isUnSupportCase = useMemo(
    () =>
      Object.values(params.requiredNamespaces)
        .map(namespace => namespace.chains || [])
        .flat()
        .some(chain => !isSupportWalletConnectChain(chain, chainInfoMap)),
    [chainInfoMap, params.requiredNamespaces],
  );

  const supportOneChain = useMemo(() => supportedChains.length === 1, [supportedChains]);
  const supportOneNamespace = useMemo(() => Object.keys(namespaces).length === 1, [namespaces]);

  const [isExpiredState, setIsExpiredState] = useState(isProposalExpired(params));
  const isExpired = useMemo(
    () => isProposalExpired(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, isExpiredState],
  );

  const namespaceRef = useRef<Record<string, WalletConnectChainInfo[]>>({});

  const onSelectAccount = useCallback((namespace: string, account: string, applyImmediately = false) => {
    return () => {
      setResult(oldState => {
        const newState: Record<string, SelectAccount> = { ...oldState };
        const selectedAccounts = newState[namespace].selectedAccounts;
        const availableAccounts = newState[namespace].availableAccounts;

        if (isAccountAll(account)) {
          if (availableAccounts.length !== selectedAccounts.length) {
            newState[namespace].selectedAccounts = availableAccounts.map(({ address }) => address);
          } else {
            newState[namespace].selectedAccounts = [];
          }
        } else {
          const exists = selectedAccounts.some(address => isSameAddress(address, account));

          if (exists) {
            newState[namespace].selectedAccounts = selectedAccounts.filter(address => !isSameAddress(address, account));
          } else {
            newState[namespace].selectedAccounts = [...selectedAccounts, reformatAddress(account)];
          }
        }

        if (applyImmediately) {
          newState[namespace].appliedAccounts = newState[namespace].selectedAccounts;
        }

        return newState;
      });
    };
  }, []);

  const onApplyAccounts = useCallback((namespace: string) => {
    setResult(oldState => {
      const newState: Record<string, SelectAccount> = { ...oldState };

      newState[namespace].appliedAccounts = newState[namespace].selectedAccounts;

      return newState;
    });
  }, []);

  const onCancelSelectAccounts = useCallback((namespace: string) => {
    setResult(oldState => {
      const newState: Record<string, SelectAccount> = { ...oldState };

      newState[namespace].selectedAccounts = newState[namespace].appliedAccounts;

      return newState;
    });
  }, []);

  useEffect(() => {
    setResult(oldState => {
      const _result: Record<string, SelectAccount> = {};

      const selectReplace = JSON.stringify(namespaces) !== JSON.stringify(namespaceRef.current);

      for (const [namespace, networks] of Object.entries(namespaces)) {
        if (WALLET_CONNECT_SUPPORT_NAMESPACES.includes(namespace)) {
          _result[namespace] = {
            networks,
            selectedAccounts: selectReplace ? [] : oldState[namespace]?.selectedAccounts || [],
            appliedAccounts: selectReplace ? [] : oldState[namespace]?.appliedAccounts || [],
            availableAccounts: noAllAccount.filter(
              acc => (WALLET_CONNECT_EIP155_NAMESPACE === namespace) === isEthereumAddress(acc.address),
            ),
          };
        }
      }

      return _result;
    });

    return () => {
      namespaceRef.current = namespaces;
    };
  }, [noAllAccount, namespaces]);

  useEffect(() => {
    const callback = (): boolean => {
      const _isExpired = isProposalExpired(params);

      setIsExpiredState(_isExpired);

      return _isExpired;
    };

    callback();

    const interval = setInterval(() => {
      const _isExpired = callback();

      if (_isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [params]);

  return {
    isExpired,
    isUnSupportCase,
    missingType,
    namespaceAccounts: result,
    onApplyAccounts,
    onCancelSelectAccounts,
    onSelectAccount,
    supportOneChain,
    supportOneNamespace,
    supportedChains,
  };
};

export default useSelectWalletConnectAccount;
