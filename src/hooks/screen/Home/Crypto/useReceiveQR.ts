// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetOriginChain, _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getReformatedAddressRelatedToChain } from 'utils/account';
import { ModalRef } from 'types/modalRef';
import useChainAssets from 'hooks/chain/useChainAssets';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { AccountAddressItemType } from 'types/account';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import { KeypairType } from '@subwallet/keyring/types';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import { AppModalContext } from 'providers/AppModalContext';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountActions, AccountProxyType } from '@subwallet/extension-base/types';

export default function useReceiveQR(tokenGroupSlug?: string) {
  const { accountProxies, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainAssets } = useChainAssets();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [selectedChain, setSelectedChain] = useState<string | undefined>();
  const [selectedAccountAddressItem, setSelectedAccountAddressItem] = useState<AccountAddressItemType | undefined>();
  const chainSupported = useGetChainSlugsByAccount();
  const { addressQrModal } = useContext(AppModalContext);
  const accountRef = useRef<ModalRef>();
  const tokenRef = useRef<ModalRef>();
  const chainRef = useRef<ModalRef>();
  const specificChain = useMemo(() => {
    if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
      return _getAssetOriginChain(assetRegistryMap[tokenGroupSlug]);
    }

    return undefined;
  }, [assetRegistryMap, tokenGroupSlug]);
  const onHandleTonAccountWarning = useHandleTonAccountWarning(() => {
    tokenRef && tokenRef.current?.closeModal?.();
    accountRef && accountRef.current?.closeModal?.();
  });

  const openAddressQrModal = useCallback(
    (address: string, accountType: KeypairType, accountProxyId: string, chainSlug: string, showQrBack = true) => {
      const processFunction = () => {
        addressQrModal.setAddressQrModal({
          visible: true,
          address,
          selectNetwork: chainSlug,
          onBack: showQrBack ? addressQrModal.hideAddressQrModal : undefined,
        });
      };
      onHandleTonAccountWarning(accountType, () => {
        processFunction();
      });
    },
    [addressQrModal, onHandleTonAccountWarning],
  );

  /* --- token Selector */
  const tokenSelectorItems = useMemo<_ChainAsset[]>(() => {
    const rawAssets = chainAssets.filter(asset => chainSupported.includes(asset.originChain));

    if (tokenGroupSlug) {
      return rawAssets.filter(asset => asset.slug === tokenGroupSlug || _getMultiChainAsset(asset) === tokenGroupSlug);
    }

    return rawAssets;
  }, [chainAssets, tokenGroupSlug, chainSupported]);

  const onCloseTokenSelector = useCallback(() => {
    tokenRef && tokenRef.current?.onCloseModal();
  }, []);

  const onSelectTokenSelector = useCallback(
    (item: _ChainAsset) => {
      if (!currentAccountProxy) {
        return;
      }

      const chainSlug = _getAssetOriginChain(item);
      const chainInfo = chainInfoMap[chainSlug];

      if (!chainInfo) {
        console.warn(`Missing chainInfo with slug ${chainSlug}`);

        return;
      }

      setSelectedChain(chainSlug);

      if (isAllAccount) {
        setTimeout(() => accountRef && accountRef.current?.onOpenModal(), 100);

        return;
      }

      for (const accountJson of currentAccountProxy.accounts) {
        const reformatedAddress = getReformatedAddressRelatedToChain(accountJson, chainInfo);

        if (reformatedAddress) {
          const accountAddressItem: AccountAddressItemType = {
            accountName: accountJson.name || '',
            accountProxyId: accountJson.proxyId || '',
            accountProxyType: currentAccountProxy.accountType,
            accountType: accountJson.type,
            address: reformatedAddress,
          };

          setSelectedAccountAddressItem(accountAddressItem);
          openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chainSlug);

          break;
        }
      }
    },
    [chainInfoMap, currentAccountProxy, isAllAccount, openAddressQrModal],
  );
  /* token Selector --- */

  /* --- account Selector */
  const accountSelectorItems = useMemo<AccountAddressItemType[]>(() => {
    const targetChain = specificChain || selectedChain;
    const chainInfo = targetChain ? chainInfoMap[targetChain] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach(ap => {
      ap.accounts.forEach(a => {
        const reformatedAddress = getReformatedAddressRelatedToChain(a, chainInfo);

        if (reformatedAddress) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address: reformatedAddress,
            accountActions: ap.accountActions,
          });
        }
      });
    });

    return result;
  }, [accountProxies, chainInfoMap, selectedChain, specificChain]);

  const onCloseAccountSelector = useCallback(() => {
    accountRef && accountRef.current?.onCloseModal();
    tokenRef && tokenRef.current?.onCloseModal();
    setSelectedChain(undefined);
    setSelectedAccountAddressItem(undefined);
  }, []);

  const onSelectAccountSelector = useCallback(
    (item: AccountAddressItemType) => {
      const targetChain = specificChain || selectedChain;

      if (!targetChain) {
        return;
      }

      setSelectedAccountAddressItem(item);
      openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain);
    },
    [openAddressQrModal, selectedChain, specificChain],
  );
  /* account Selector --- */

  const onOpenReceive = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    const handleShowQrModal = (chain: string) => {
      const chainInfo = chainInfoMap[chain];

      if (!chainInfo) {
        return;
      }

      for (const accountJson of currentAccountProxy.accounts) {
        const reformatedAddress = getReformatedAddressRelatedToChain(accountJson, chainInfo);

        if (reformatedAddress) {
          const accountAddressItem: AccountAddressItemType = {
            accountName: accountJson.name || '',
            accountProxyId: accountJson.proxyId || '',
            accountProxyType: currentAccountProxy.accountType,
            accountType: accountJson.type,
            address: reformatedAddress,
          };

          setSelectedAccountAddressItem(accountAddressItem);

          openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chain, false);

          break;
        }
      }
    };

    if (specificChain) {
      if (!chainSupported.includes(specificChain)) {
        console.warn('tokenGroupSlug does not work with current account');

        return;
      }

      // current account is All
      if (isAllAccount) {
        accountRef && accountRef.current?.onOpenModal();

        return;
      }

      // current account is not All, just do show QR logic

      handleShowQrModal(specificChain);

      return;
    }

    if (tokenSelectorItems.length === 1 && tokenGroupSlug) {
      if (isAllAccount) {
        setSelectedChain(tokenSelectorItems[0].originChain);
        accountRef && accountRef.current?.onOpenModal();

        return;
      }

      handleShowQrModal(tokenSelectorItems[0].originChain);

      return;
    }

    tokenRef && tokenRef.current?.onOpenModal();
  }, [
    chainInfoMap,
    chainSupported,
    currentAccountProxy,
    isAllAccount,
    openAddressQrModal,
    specificChain,
    tokenGroupSlug,
    tokenSelectorItems,
  ]);

  useEffect(() => {
    if (addressQrModal.addressModalState.visible && selectedAccountAddressItem) {
      addressQrModal.setAddressQrModal(prev => {
        if (!prev || !TON_CHAINS.includes(prev.selectNetwork || '')) {
          return prev;
        }

        const targetAddress = accountSelectorItems.find(
          i => i.accountProxyId === selectedAccountAddressItem.accountProxyId,
        )?.address;

        if (targetAddress) {
          return {
            ...prev,
            address: targetAddress,
          };
        }

        const _selectedAccount = accountSelectorItems.find(
          item => item.accountName === selectedAccountAddressItem.accountName,
        );
        const isSoloAccount = _selectedAccount?.accountProxyType === AccountProxyType.SOLO;
        const hasTonChangeWalletContractVersion = _selectedAccount?.accountActions?.includes(
          AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION,
        );
        const latestAddress = _selectedAccount?.address;

        if (isSoloAccount && hasTonChangeWalletContractVersion && latestAddress) {
          setSelectedAccountAddressItem(_selectedAccount);

          return {
            ...prev,
            address: latestAddress,
          };
        }

        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSelectorItems, selectedAccountAddressItem]);

  return {
    onOpenReceive,
    openSelectAccount: onSelectAccountSelector,
    openSelectToken: onSelectTokenSelector,
    onCloseSelectAccount: onCloseAccountSelector,
    onCloseSelectToken: onCloseTokenSelector,
    accountSelectorItems,
    tokenSelectorItems,
    accountRef,
    tokenRef,
    chainRef,
  };
}
