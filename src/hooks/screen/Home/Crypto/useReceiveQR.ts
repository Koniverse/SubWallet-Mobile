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
import { getAccountType } from 'utils/index';
import { RootState } from 'stores/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { getAccountTypeByTokenGroup } from 'hooks/screen/Home/Crypto/utils';
import { findAccountByAddress } from 'utils/account';
import { ModalRef } from 'types/modalRef';

type ReceiveSelectedResult = {
  selectedAccount?: string;
  selectedNetwork?: string;
};

export default function useReceiveQR(tokenGroupSlug?: string) {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
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
      const targetAccountType = getAccountTypeByTokenGroup(tokenGroupSlug, assetRegistryMap, chainInfoMap);

      if (targetAccountType === 'ALL') {
        return accounts.filter(a => !checkIsAccountAll(a.address));
      }

      return accounts.filter(a => getAccountType(a.address) === targetAccountType);
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
        if (
          acc?.originGenesisHash &&
          chainInfoMap[asset.originChain].substrateInfo?.genesisHash !== acc.originGenesisHash
        ) {
          return false;
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
    [tokenGroupSlug, assetRegistryMap, accounts, chainInfoMap],
  );

  const onOpenReceive = useCallback(() => {
    if (!currentAccount) {
      return;
    }

    if (checkIsAccountAll(currentAccount.address)) {
      accountRef && accountRef.current?.onOpenModal();
    } else {
      // if currentAccount is ledger type
      if (currentAccount.originGenesisHash) {
        const network = findNetworkJsonByGenesisHash(chainInfoMap, currentAccount.originGenesisHash);

        if (network) {
          setReceiveSelectedResult(prevState => ({ ...prevState, selectedNetwork: network.slug }));
          setQrModalVisible(true);

          return;
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
