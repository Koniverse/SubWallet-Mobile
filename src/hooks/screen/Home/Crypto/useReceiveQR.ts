// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import {
  _getMultiChainAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { isAccountAll as checkIsAccountAll } from '@subwallet/extension-base/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { getAccountType } from 'utils/index';
import { RootState } from 'stores/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { getAccountTypeByTokenGroup } from 'hooks/screen/Home/Crypto/utils';

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
  const [tokenSelectorItems, setTokenSelectorItems] = useState<_ChainAsset[]>([]);
  const [isTokenSelectorModalVisible, setTokenSelectorModalVisible] = useState<boolean>(false);
  const [isAccountSelectorModalVisible, setAccountSelectorModalVisible] = useState<boolean>(false);
  const [isQrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [{ selectedAccount, selectedNetwork }, setReceiveSelectedResult] = useState<ReceiveSelectedResult>({
    selectedAccount: isAllAccount ? undefined : currentAccount?.address,
  });

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

  const getTokenSelectorItems = useCallback(
    (_selectedAccount: string) => {
      // if selectedAccount is not available or is ethereum type
      if (!_selectedAccount) {
        return [];
      }

      // if tokenGroupSlug is token slug
      if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
        return [assetRegistryMap[tokenGroupSlug]];
      }

      const isEvmAddress = isEthereumAddress(_selectedAccount);

      return Object.values(assetRegistryMap).filter(asset => {
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
    [tokenGroupSlug, assetRegistryMap, chainInfoMap],
  );

  const actionWithSetTimeout = useCallback((action: () => void) => {
    setTimeout(action, HIDE_MODAL_DURATION);
  }, []);

  const onOpenReceive = useCallback(() => {
    if (!currentAccount) {
      return;
    }

    if (checkIsAccountAll(currentAccount.address)) {
      setAccountSelectorModalVisible(true);
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

      setTokenSelectorModalVisible(true);
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
          setAccountSelectorModalVisible(false);
          actionWithSetTimeout(() => {
            setQrModalVisible(true);
          });

          return;
        }
      }

      setAccountSelectorModalVisible(false);
      actionWithSetTimeout(() => {
        setTokenSelectorModalVisible(true);
      });
    },
    [actionWithSetTimeout, getTokenSelectorItems, tokenGroupSlug],
  );

  const openSelectToken = useCallback(
    (value: TokenItemType) => {
      setReceiveSelectedResult(prevState => ({ ...prevState, selectedNetwork: value.originChain }));
      setTokenSelectorModalVisible(false);
      actionWithSetTimeout(() => {
        setQrModalVisible(true);
      });
    },
    [actionWithSetTimeout],
  );

  const onCloseSelectAccount = useCallback(() => {
    setAccountSelectorModalVisible(false);
  }, []);

  const onCloseSelectToken = useCallback(() => {
    setTokenSelectorModalVisible(false);
  }, []);

  const onCloseQrModal = useCallback(() => {
    setQrModalVisible(false);
  }, []);

  useEffect(() => {
    setReceiveSelectedResult(prev => ({
      ...prev,
      selectedAccount: currentAccount?.address,
    }));
  }, [currentAccount?.address]);

  return {
    isTokenSelectorModalVisible,
    isAccountSelectorModalVisible,
    isQrModalVisible,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    onCloseSelectAccount,
    onCloseSelectToken,
    onCloseQrModal,
    selectedAccount,
    accountSelectorItems,
    tokenSelectorItems,
    selectedNetwork,
  };
}
