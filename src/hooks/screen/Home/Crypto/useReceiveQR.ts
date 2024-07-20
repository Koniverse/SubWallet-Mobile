// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import {
  _getMultiChainAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { isAccountAll as checkIsAccountAll } from '@subwallet/extension-base/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { RootState } from 'stores/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { findAccountByAddress } from 'utils/account';
import { ModalRef } from 'types/modalRef';
import useChainAssets from 'hooks/chain/useChainAssets';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { MantaPayConfig } from '@subwallet/extension-base/background/KoniTypes';

type ReceiveSelectedResult = {
  selectedAccount?: string;
  selectedNetwork?: string;
};

const getChainsByTokenGroup = (tokenGroupSlug: string, assetRegistryMap: Record<string, _ChainAsset>): string[] => {
  // case tokenGroupSlug is token slug
  if (assetRegistryMap[tokenGroupSlug]) {
    return [assetRegistryMap[tokenGroupSlug].originChain];
  }

  // case tokenGroupSlug is multiChainAsset slug

  const assetRegistryItems: _ChainAsset[] = Object.values(assetRegistryMap).filter(assetItem => {
    return _isAssetFungibleToken(assetItem) && _getMultiChainAsset(assetItem) === tokenGroupSlug;
  });

  const map: Record<string, boolean> = {};

  for (const assetItem of assetRegistryItems) {
    const chainSlug = assetRegistryMap[assetItem.slug].originChain;

    map[chainSlug] = true;
  }

  return Object.keys(map);
};

function isMantaPayEnabled(account: AccountJson | null, configs: MantaPayConfig[]) {
  for (const config of configs) {
    if (config.address === account?.address) {
      return true;
    }
  }

  return false;
}

export default function useReceiveQR(tokenGroupSlug?: string) {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const assetRegistryMap = useChainAssets().chainAssetRegistry;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const mantaPayConfigs = useSelector((state: RootState) => state.mantaPay.configs);
  const [tokenSelectorItems, setTokenSelectorItems] = useState<TokenItemType[]>([]);
  const [isQrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [{ selectedAccount, selectedNetwork }, setReceiveSelectedResult] = useState<ReceiveSelectedResult>({
    selectedAccount: isAllAccount ? undefined : currentAccount?.address,
  });
  useEffect(() => {
    if (!isQrModalVisible) {
      setReceiveSelectedResult({ selectedAccount: isAllAccount ? undefined : currentAccount?.address });
    }
  }, [currentAccount?.address, isAllAccount, isQrModalVisible]);

  const accountRef = useRef<ModalRef>();
  const tokenRef = useRef<ModalRef>();
  const chainRef = useRef<ModalRef>();

  const accountSelectorItems = useMemo<AccountJson[]>(() => {
    if (!isAllAccount) {
      return [];
    }

    if (tokenGroupSlug) {
      const chains = getChainsByTokenGroup(tokenGroupSlug, assetRegistryMap);

      return accounts.filter(account => {
        const isEvm = isEthereumAddress(account.address);
        const isAll = checkIsAccountAll(account.address);

        if (isAll) {
          return false;
        }

        if (account.isHardware) {
          if (!account.isGeneric) {
            if (!isEvm) {
              const availableGen: string[] = account.availableGenesisHashes || [];
              const networks = availableGen
                .map(gen => findNetworkJsonByGenesisHash(chainInfoMap, gen)?.slug)
                .filter(slug => slug) as string[];

              return networks.some(n => chains.includes(n));
            }
          }
        }

        return chains.some(chain => {
          const info = chainInfoMap[chain];

          if (info) {
            return isEvm === _isChainEvmCompatible(info);
          } else {
            return false;
          }
        });
      });
    }

    return accounts.filter(a => !checkIsAccountAll(a.address));
  }, [isAllAccount, tokenGroupSlug, accounts, assetRegistryMap, chainInfoMap]);

  const selectedAccountMap: Record<string, boolean> = useMemo(() => {
    let result: Record<string, boolean> = {};
    accountSelectorItems.forEach(acc => {
      result[acc.address] = acc.address === selectedAccount;
    });

    return result;
  }, [accountSelectorItems, selectedAccount]);

  const getTokenSelectorItems = useCallback(
    (_selectedAccount: string): TokenItemType[] => {
      // if selectedAccount is not available or is ethereum type
      if (!_selectedAccount) {
        return [];
      }

      // if tokenGroupSlug is token slug
      if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
        return [assetRegistryMap[tokenGroupSlug]];
      }

      const isEvmAddress = isEthereumAddress(_selectedAccount);
      const acc = findAccountByAddress(accounts, _selectedAccount);

      return Object.values(assetRegistryMap).filter(asset => {
        const availableGen: string[] = acc?.availableGenesisHashes || [];

        if (
          acc?.isHardware &&
          !acc?.isGeneric &&
          !availableGen.includes(chainInfoMap[asset.originChain].substrateInfo?.genesisHash || '')
        ) {
          return false;
        }

        if (_MANTA_ZK_CHAIN_GROUP.includes(asset.originChain) && asset.symbol.startsWith(_ZK_ASSET_PREFIX)) {
          return isMantaPayEnabled(acc, mantaPayConfigs);
        }

        if (_isAssetFungibleToken(asset)) {
          if (_isChainEvmCompatible(chainInfoMap[asset.originChain]) === isEvmAddress) {
            if (tokenGroupSlug) {
              return _getMultiChainAsset(asset) === tokenGroupSlug;
            }

            return true;
          }
        }

        return false;
      });
    },
    [tokenGroupSlug, assetRegistryMap, accounts, chainInfoMap, mantaPayConfigs],
  );

  const onOpenReceive = useCallback(() => {
    if (!currentAccount) {
      return;
    }

    if (checkIsAccountAll(currentAccount.address)) {
      accountRef && accountRef.current?.onOpenModal();
    } else {
      // if currentAccount is ledger type
      if (currentAccount.isHardware) {
        if (!currentAccount.isGeneric) {
          const availableGen: string[] = currentAccount.availableGenesisHashes || [];
          const networks = availableGen
            .map(gen => findNetworkJsonByGenesisHash(chainInfoMap, gen)?.slug)
            .filter(slug => slug) as string[];

          if (networks.length === 1) {
            setReceiveSelectedResult(prevState => ({ ...prevState, selectedNetwork: networks[0] }));
            setQrModalVisible(true);

            return;
          }
        }
      }

      const _tokenSelectorItems = getTokenSelectorItems(currentAccount.address);

      setTokenSelectorItems(_tokenSelectorItems);

      if (tokenGroupSlug) {
        if (_tokenSelectorItems.length === 1) {
          setReceiveSelectedResult(prev => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
          setQrModalVisible(true);

          return;
        }
      }
      tokenRef && tokenRef.current?.onOpenModal();
    }
  }, [chainInfoMap, currentAccount, getTokenSelectorItems, tokenGroupSlug]);

  const openSelectAccount = useCallback(
    (account: AccountJson) => {
      setReceiveSelectedResult({ selectedAccount: account.address });
      const _tokenSelectorItems = getTokenSelectorItems(account.address);

      setTokenSelectorItems(_tokenSelectorItems);

      if (tokenGroupSlug) {
        if (_tokenSelectorItems.length === 1) {
          setReceiveSelectedResult(prev => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
          accountRef && accountRef.current?.onCloseModal();
          setQrModalVisible(true);

          return;
        }
      }

      tokenRef && tokenRef.current?.onOpenModal();
    },
    [getTokenSelectorItems, tokenGroupSlug],
  );

  const openSelectToken = useCallback((value: TokenItemType) => {
    setReceiveSelectedResult(prevState => ({ ...prevState, selectedNetwork: value.originChain }));
    tokenRef && tokenRef.current?.onCloseModal();
    accountRef && accountRef.current?.onCloseModal();
    setQrModalVisible(true);
  }, []);

  const onCloseSelectAccount = useCallback(() => {
    accountRef && accountRef.current?.onCloseModal();
  }, []);

  const onCloseSelectToken = useCallback(() => {
    tokenRef && tokenRef.current?.onCloseModal();
  }, []);

  useEffect(() => {
    setReceiveSelectedResult(prev => ({
      ...prev,
      selectedAccount: currentAccount?.address,
    }));
  }, [currentAccount?.address]);

  return {
    isQrModalVisible,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    onCloseSelectAccount,
    onCloseSelectToken,
    setQrModalVisible,
    selectedAccount,
    accountSelectorItems,
    tokenSelectorItems,
    selectedNetwork,
    accountRef,
    tokenRef,
    chainRef,
    selectedAccountMap,
  };
}
