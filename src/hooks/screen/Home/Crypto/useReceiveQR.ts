// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  _getAssetOriginChain,
  _getMultiChainAsset,
  _isChainBitcoinCompatible,
  _isChainInfoCompatibleWithAccountInfo,
} from '@subwallet/extension-base/services/chain-service/utils';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ModalRef } from 'types/modalRef';
import useChainAssets from 'hooks/chain/useChainAssets';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AccountAddressItemType, AccountTokenAddress } from 'types/account';
import { BitcoinMainnetKeypairTypes, BitcoinTestnetKeypairTypes, KeypairType } from '@subwallet/keyring/types';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import { AppModalContext } from 'providers/AppModalContext';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import {
  AccountActions,
  AccountChainType,
  AccountJson,
  AccountProxy,
  AccountProxyType,
} from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useGetChainSlugsByCurrentAccountProxy from 'hooks/chain/useGetChainSlugsByCurrentAccountProxy';
import useCoreCreateReformatAddress from 'hooks/common/useCoreCreateReformatAddress';
import useGetBitcoinAccounts from 'hooks/common/useGetBitcoinAccounts';

type SelectedTokenInfo = {
  tokenSlug: string;
  chainSlug: string;
};

export default function useReceiveQR(tokenGroupSlug?: string) {
  const navigation = useNavigation<RootNavigationProps>();
  const { accountProxies, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainAssets } = useChainAssets();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectedTokenInfo | undefined>();
  const [selectedAccountAddressItem, setSelectedAccountAddressItem] = useState<AccountAddressItemType | undefined>();
  const chainSupported = useGetChainSlugsByCurrentAccountProxy();
  const { addressQrModal, selectAddressFormatModal, accountTokenAddressModal } = useContext(AppModalContext);
  const accountRef = useRef<ModalRef>();
  const tokenRef = useRef<ModalRef>();
  const chainRef = useRef<ModalRef>();
  const specificSelectedTokenInfo = useMemo<SelectedTokenInfo | undefined>(() => {
    if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
      return {
        tokenSlug: tokenGroupSlug,
        chainSlug: _getAssetOriginChain(assetRegistryMap[tokenGroupSlug]),
      };
    }

    return undefined;
  }, [assetRegistryMap, tokenGroupSlug]);
  const onHandleTonAccountWarning = useHandleTonAccountWarning(() => {
    tokenRef && tokenRef.current?.closeModal?.();
    accountRef && accountRef.current?.closeModal?.();
  });

  const getReformatAddress = useCoreCreateReformatAddress();
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const getBitcoinAccounts = useGetBitcoinAccounts();

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

  const openAccountTokenAddressModal = useCallback(
    (accounts: AccountTokenAddress[]) => {
      const processFunction = () => {
        accountTokenAddressModal.setAccountTokenAddressModalState({
          visible: true,
          items: accounts,
          onBack: accountTokenAddressModal.hideAccountTokenAddressModal,
        });
      };

      processFunction();
    },
    [accountTokenAddressModal],
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

      setSelectedTokenInfo({
        tokenSlug: item.slug,
        chainSlug,
      });

      if (isAllAccount) {
        setTimeout(() => accountRef && accountRef.current?.onOpenModal(), 100);

        return;
      }

      const isBitcoinChain = _isChainBitcoinCompatible(chainInfo);

      if (isBitcoinChain) {
        const accountTokenAddressList = getBitcoinAccounts(
          chainSlug,
          item.slug,
          chainInfo,
          currentAccountProxy.accounts,
        );

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);
        } else if (accountTokenAddressList.length === 1) {
          openAddressQrModal(
            accountTokenAddressList[0].accountInfo.address,
            accountTokenAddressList[0].accountInfo.type,
            currentAccountProxy.id,
            chainSlug,
            () => {
              setSelectedAccountAddressItem(undefined);
            },
          );
        }

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
      getBitcoinAccounts,
      getReformatAddress,
      isAllAccount,
      openAccountTokenAddressModal,
      openAddressFormatModal,
      openAddressQrModal,
    ],
  );
  /* token Selector --- */

  /* --- account Selector */
  const accountSelectorItems = useMemo<AccountAddressItemType[]>(() => {
    const targetTokenInfo = specificSelectedTokenInfo || selectedTokenInfo;
    const chainInfo = targetTokenInfo ? chainInfoMap[targetTokenInfo.chainSlug] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy, a: AccountJson, _chainInfo: _ChainInfo) => {
      const reformatedAddress = getReformatAddress(a, _chainInfo);

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
    };

    const getPreferredBitcoinAccount = (accounts: AccountJson[]) => {
      const bitcoinAccounts = accounts.filter(
        a => a.chainType === AccountChainType.BITCOIN && _isChainInfoCompatibleWithAccountInfo(chainInfo, a),
      );

      return bitcoinAccounts.find(a => a.type === 'bitcoin-84' || a.type === 'bittest-84') || bitcoinAccounts[0];
    };

    accountProxies.forEach(ap => {
      // case bitcoin accounts
      if (ap.chainTypes.includes(AccountChainType.BITCOIN)) {
        const preferredBitcoinAccount = getPreferredBitcoinAccount(ap.accounts);

        preferredBitcoinAccount && updateResult(ap, preferredBitcoinAccount, chainInfo);
      }
      // case non-bitcoin accounts
      ap.accounts.forEach(a => {
        if (a.chainType === AccountChainType.BITCOIN) {
          return;
        }

        updateResult(ap, a, chainInfo);
      });
    });

    return result;
  }, [accountProxies, chainInfoMap, getReformatAddress, selectedTokenInfo, specificSelectedTokenInfo]);

  const onCloseAccountSelector = useCallback(() => {
    accountRef && accountRef.current?.onCloseModal();
    tokenRef && tokenRef.current?.onCloseModal();
    setSelectedTokenInfo(undefined);
    setSelectedAccountAddressItem(undefined);
  }, []);

  const onSelectAccountSelector = useCallback(
    (item: AccountAddressItemType) => {
      const targetTokenInfo = specificSelectedTokenInfo || selectedTokenInfo;

      if (!targetTokenInfo) {
        return;
      }

      const targetChain = targetTokenInfo.chainSlug;

      const chainInfo = chainInfoMap[targetChain];

      if (!chainInfo) {
        return;
      }

      const isBitcoinAccountItem = [...BitcoinMainnetKeypairTypes, ...BitcoinTestnetKeypairTypes].includes(
        item.accountType,
      );

      setSelectedAccountAddressItem(item);
      tokenRef && tokenRef.current?.onCloseModal();
      accountRef && accountRef.current?.onCloseModal();

      if (isBitcoinAccountItem) {
        const targetAccountProxy = accountProxies.find(ap => ap.id === item.accountProxyId);

        if (!targetAccountProxy) {
          return;
        }

        const accountTokenAddressList = getBitcoinAccounts(
          targetChain,
          targetTokenInfo.tokenSlug,
          chainInfo,
          targetAccountProxy.accounts,
        );

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);
        } else {
          openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain);
        }

        return;
      }

      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(targetChain);

      if (isPolkadotUnifiedChain) {
        openAddressFormatModal(chainInfo.name, item.address, targetChain);
      } else {
        openAddressQrModal(item.address, item.accountType, item.accountProxyId, targetChain);
      }
    },
    [
      accountProxies,
      chainInfoMap,
      checkIsPolkadotUnifiedChain,
      getBitcoinAccounts,
      openAccountTokenAddressModal,
      openAddressFormatModal,
      openAddressQrModal,
      selectedTokenInfo,
      specificSelectedTokenInfo,
    ],
  );
  /* account Selector --- */

  const onOpenReceive = useCallback(() => {
    if (!currentAccountProxy) {
      return;
    }

    const handleShowQrModal = (chainSlug: string, tokenSlug: string) => {
      const chainInfo = chainInfoMap[chainSlug];

      if (!chainInfo) {
        return;
      }

      const isBitcoinChain = _isChainBitcoinCompatible(chainInfo);

      if (isBitcoinChain) {
        const accountTokenAddressList = getBitcoinAccounts(
          chainSlug,
          tokenSlug,
          chainInfo,
          currentAccountProxy.accounts,
        );

        if (accountTokenAddressList.length > 1) {
          openAccountTokenAddressModal(accountTokenAddressList);
        } else if (accountTokenAddressList.length === 1) {
          openAddressQrModal(
            accountTokenAddressList[0].accountInfo.address,
            accountTokenAddressList[0].accountInfo.type,
            currentAccountProxy.id,
            chainSlug,
            () => {
              setSelectedAccountAddressItem(undefined);
            },
          );
        }

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
    };

    if (specificSelectedTokenInfo) {
      if (!chainSupported.includes(specificSelectedTokenInfo.chainSlug)) {
        console.warn('tokenGroupSlug does not work with current account');

        return;
      }

      // current account is All
      if (isAllAccount) {
        accountRef && accountRef.current?.onOpenModal();

        return;
      }

      // current account is not All, just do show QR logic

      handleShowQrModal(specificSelectedTokenInfo.chainSlug, specificSelectedTokenInfo.tokenSlug);

      return;
    }

    if (tokenSelectorItems.length === 1 && tokenGroupSlug) {
      if (isAllAccount) {
        setSelectedTokenInfo({
          tokenSlug: tokenSelectorItems[0].slug,
          chainSlug: tokenSelectorItems[0].originChain,
        });
        accountRef && accountRef.current?.onOpenModal();

        return;
      }

      handleShowQrModal(tokenSelectorItems[0].originChain, tokenSelectorItems[0].slug);

      return;
    }

    tokenRef && tokenRef.current?.onOpenModal();
  }, [
    chainInfoMap,
    chainSupported,
    checkIsPolkadotUnifiedChain,
    currentAccountProxy,
    getBitcoinAccounts,
    getReformatAddress,
    isAllAccount,
    openAccountTokenAddressModal,
    openAddressFormatModal,
    openAddressQrModal,
    specificSelectedTokenInfo,
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
