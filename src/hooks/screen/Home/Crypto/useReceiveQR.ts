// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetOriginChain, _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
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
import { VoidFunction } from 'types/index';
import useReformatAddress from 'hooks/common/useReformatAddress';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

export default function useReceiveQR(tokenGroupSlug?: string) {
  const navigation = useNavigation<RootNavigationProps>();
  const { accountProxies, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainAssets } = useChainAssets();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [selectedChain, setSelectedChain] = useState<string | undefined>();
  const [selectedAccountAddressItem, setSelectedAccountAddressItem] = useState<AccountAddressItemType | undefined>();
  const chainSupported = useGetChainSlugsByAccount();
  const { addressQrModal, selectAddressFormatModal } = useContext(AppModalContext);
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

  const getReformatAddress = useReformatAddress();
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

  const openAddressQrModal = useCallback(
    (
      address: string,
      accountType: KeypairType,
      accountProxyId: string,
      chainSlug: string,
      closeCallback?: VoidFunction,
    ) => {
      const processFunction = () => {
        addressQrModal.setAddressQrModal({
          visible: true,
          address,
          selectNetwork: chainSlug,
          onBack: () => {
            addressQrModal.hideAddressQrModal();
            closeCallback?.();
          },
          navigation: navigation,
        });
      };
      onHandleTonAccountWarning(accountType, () => {
        processFunction();
      });
    },
    [addressQrModal, navigation, onHandleTonAccountWarning],
  );

  const openAddressFormatModal = useCallback(
    (name: string, address: string, chainSlug: string, closeCallback?: VoidFunction) => {
      const processFunction = () => {
        selectAddressFormatModal.setSelectAddressFormatModalState({
          visible: true,
          name: name,
          address: address,
          chainSlug: chainSlug,
          onBack: () => {
            selectAddressFormatModal.hideSelectAddressFormatModal();
            closeCallback?.();
          },
          navigation: navigation,
        });
      };

      processFunction();
    },
    [navigation, selectAddressFormatModal],
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

      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(chainSlug);

      for (const accountJson of currentAccountProxy.accounts) {
        const reformatedAddress = getReformatAddress(accountJson, chainInfo);

        if (reformatedAddress) {
          const accountAddressItem: AccountAddressItemType = {
            accountName: accountJson.name || '',
            accountProxyId: accountJson.proxyId || '',
            accountProxyType: currentAccountProxy.accountType,
            accountType: accountJson.type,
            address: reformatedAddress,
          };

          tokenRef && tokenRef.current?.onCloseModal();
          setSelectedAccountAddressItem(accountAddressItem);
          if (isPolkadotUnifiedChain) {
            openAddressFormatModal(chainInfo.name, reformatedAddress, chainSlug, () => {
              setSelectedAccountAddressItem(undefined);
            });
          } else {
            openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chainSlug, () => {
              setSelectedAccountAddressItem(undefined);
            });
          }
          break;
        }
      }
    },
    [
      chainInfoMap,
      checkIsPolkadotUnifiedChain,
      currentAccountProxy,
      getReformatAddress,
      isAllAccount,
      openAddressFormatModal,
      openAddressQrModal,
    ],
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
        const reformatedAddress = getReformatAddress(a, chainInfo);

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
  }, [accountProxies, chainInfoMap, getReformatAddress, selectedChain, specificChain]);

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

      const chainInfo = chainInfoMap[targetChain];

      setSelectedAccountAddressItem(item);
      tokenRef && tokenRef.current?.onCloseModal();
      accountRef && accountRef.current?.onCloseModal();
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(targetChain);

      if (isPolkadotUnifiedChain) {
        openAddressFormatModal(chainInfo.name, item.address, targetChain);
      } else {
        openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain);
      }
    },
    [
      chainInfoMap,
      checkIsPolkadotUnifiedChain,
      openAddressFormatModal,
      openAddressQrModal,
      selectedChain,
      specificChain,
    ],
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

      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(chain);

      for (const accountJson of currentAccountProxy.accounts) {
        const reformatedAddress = getReformatAddress(accountJson, chainInfo);

        if (reformatedAddress) {
          const accountAddressItem: AccountAddressItemType = {
            accountName: accountJson.name || '',
            accountProxyId: accountJson.proxyId || '',
            accountProxyType: currentAccountProxy.accountType,
            accountType: accountJson.type,
            address: reformatedAddress,
          };

          setSelectedAccountAddressItem(accountAddressItem);

          if (isPolkadotUnifiedChain) {
            openAddressFormatModal(chainInfo.name, reformatedAddress, chain, () => {
              setSelectedAccountAddressItem(undefined);
            });
          } else {
            openAddressQrModal(reformatedAddress, accountJson.type, currentAccountProxy.id, chain, () => {
              setSelectedAccountAddressItem(undefined);
            });
          }

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
    checkIsPolkadotUnifiedChain,
    currentAccountProxy,
    getReformatAddress,
    isAllAccount,
    openAddressFormatModal,
    openAddressQrModal,
    specificChain,
    tokenGroupSlug,
    tokenSelectorItems,
  ]);

  // useEffect(() => {
  //   if (addressQrModal.addressModalState.visible && selectedAccountAddressItem) {
  //     onOpenReceive();
  //   }
  // }, [addressQrModal.addressModalState.visible, selectedAccountAddressItem, onOpenReceive]);

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
  }, [accountSelectorItems, addressQrModal.addressModalState.visible, selectedAccountAddressItem]);

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
