import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { AccountChainAddress, AccountInfoType, AccountTokenAddress } from 'types/account';
import useGetAccountChainAddresses from 'hooks/account/useGetAccountChainAddresses';
import { AccountProxy } from '@subwallet/extension-base/types';
import { AccountChainAddressItem } from 'components/common/SelectModal/parts/AccountChainAddressItem';
import { AppModalContext } from 'providers/AppModalContext';
import { VoidFunction } from 'types/index';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import { useToast } from 'react-native-toast-notifications';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';
import { ListRenderItemInfo } from '@shopify/flash-list';
import useGetBitcoinAccounts from 'hooks/common/useGetBitcoinAccounts';
import { getBitcoinAddressInfo, isBitcoinAddress } from '@subwallet/keyring';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useCopyClipboard from 'hooks/common/useCopyClipboard';

interface Props {
  accountProxy: AccountProxy;
  selectedValueMap: Record<string, boolean>;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  onCancel: VoidFunction;
}

interface BitcoinAccountsByNetwork {
  mainnet: AccountInfoType[];
  testnet: AccountInfoType[];
}

export const AccountChainAddressesSelector = ({
  accountProxy,
  selectedValueMap,
  disabled,
  renderSelected,
  accountSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  onCancel: _onCancel,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const getBitcoinAccounts = useGetBitcoinAccounts();
  const onHandleTonAccountWarning = useHandleTonAccountWarning(() => {
    accountSelectorRef?.current?.closeModal?.();
  });
  const { addressQrModal, selectAddressFormatModal, accountTokenAddressModal } = useContext(AppModalContext);
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const navigation = useNavigation<RootNavigationProps>();
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const { show } = useToast();
  const { copyToClipboard } = useCopyClipboard();

  const bitcoinAccountList: AccountInfoType[] = useMemo(() => {
    if (!items) {
      return [];
    }

    return items
      .filter(item => isBitcoinAddress(item.address))
      .map(item => ({
        address: item.address,
        type: item.accountType,
      }));
  }, [items]);

  const soloBitcoinAccount = useMemo((): BitcoinAccountsByNetwork => {
    if (!bitcoinAccountList || bitcoinAccountList.length === 0) {
      return { mainnet: [], testnet: [] };
    }

    const mainnet: AccountInfoType[] = [];
    const testnet: AccountInfoType[] = [];

    bitcoinAccountList.forEach(account => {
      const bitcoinAddressInfo = getBitcoinAddressInfo(account.address);

      if (bitcoinAddressInfo.network === 'mainnet') {
        mainnet.push(account);
      } else {
        testnet.push(account);
      }
    });

    return { mainnet, testnet };
  }, [bitcoinAccountList]);

  const filteredItems = useMemo(() => {
    if (!items) {
      return [];
    }

    return items.filter(item => {
      if (isBitcoinAddress(item.address)) {
        const addressInfo = getBitcoinAddressInfo(item.address);

        if (addressInfo.network === 'mainnet' && soloBitcoinAccount.mainnet.length > 1) {
          return [BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type);
        } else if (addressInfo.network === 'testnet' && soloBitcoinAccount.testnet.length > 1) {
          return [BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type);
        }

        return true;
      }

      return true;
    });
  }, [items, soloBitcoinAccount.mainnet.length, soloBitcoinAccount.testnet.length]);

  const getBitcoinTokenAddresses = useCallback(
    (slug: string, bitcoinAccounts: AccountInfoType[]): AccountTokenAddress[] => {
      const chainInfo = chainInfoMap[slug];

      if (!chainInfo) {
        return [];
      }

      const nativeTokenSlug = _getChainNativeTokenSlug(chainInfo);

      return getBitcoinAccounts(slug, nativeTokenSlug, chainInfo, bitcoinAccounts);
    },
    [chainInfoMap, getBitcoinAccounts],
  );

  const openAccountTokenAddressModal = useCallback(
    (accounts: AccountTokenAddress[]) => {
      const processFunction = () => {
        accountTokenAddressModal.setAccountTokenAddressModalState({
          visible: true,
          items: accounts,
          onBack: accountTokenAddressModal.hideAccountTokenAddressModal,
          navigation: navigation,
        });
      };

      processFunction();
    },
    [accountTokenAddressModal, navigation],
  );

  const openSelectAddressFormatModal = useCallback(
    (item: AccountChainAddress) => {
      selectAddressFormatModal.setSelectAddressFormatModalState({
        visible: true,
        name: item.name,
        address: item.address,
        chainSlug: item.slug,
        onBack: selectAddressFormatModal.hideSelectAddressFormatModal,
        navigation: navigation,
      });
    },
    [navigation, selectAddressFormatModal],
  );

  const onShowQr = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
        const isBitcoinChain = isBitcoinAddress(item.address);

        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            visible: true,
            address: item.address,
            selectNetwork: item.slug,
            onBack: addressQrModal.hideAddressQrModal,
            navigation: navigation,
          });
        };

        if (isPolkadotUnifiedChain) {
          openSelectAddressFormatModal(item);

          return;
        }

        if (isBitcoinChain) {
          // TODO: Currently, only supports Bitcoin native token.
          const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

          if (accountTokenAddressList.length > 1) {
            openAccountTokenAddressModal(accountTokenAddressList);

            return;
          }
        }

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [
      addressQrModal,
      bitcoinAccountList,
      checkIsPolkadotUnifiedChain,
      getBitcoinTokenAddresses,
      navigation,
      onHandleTonAccountWarning,
      openAccountTokenAddressModal,
      openSelectAddressFormatModal,
    ],
  );

  const onCopyAddress = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
        const isBitcoinChain = isBitcoinAddress(item.address);

        const processFunction = () => {
          copyToClipboard(item.address || '');
          show('Copied to clipboard');
        };

        if (isPolkadotUnifiedChain) {
          openSelectAddressFormatModal(item);
          return;
        }

        if (isBitcoinChain) {
          const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

          if (accountTokenAddressList.length > 1) {
            openAccountTokenAddressModal(accountTokenAddressList);
            return;
          }
        }

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [
      bitcoinAccountList,
      checkIsPolkadotUnifiedChain,
      copyToClipboard,
      getBitcoinTokenAddresses,
      onHandleTonAccountWarning,
      openAccountTokenAddressModal,
      openSelectAddressFormatModal,
      show,
    ],
  );

  const onPressInfoButton = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const isBitcoinChain = isBitcoinAddress(item.address);

        if (isBitcoinChain) {
          const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);

          if (accountTokenAddressList.length > 1) {
            delayActionAfterDismissKeyboard(() => openAccountTokenAddressModal(accountTokenAddressList));
            return;
          }
        }

        delayActionAfterDismissKeyboard(() => openSelectAddressFormatModal(item));
      };
    },
    [bitcoinAccountList, getBitcoinTokenAddresses, openAccountTokenAddressModal, openSelectAddressFormatModal],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountChainAddress>) => {
      const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
      const isBitcoinChain = isBitcoinAddress(item.address);
      let tooltip = '';

      if (isPolkadotUnifiedChain) {
        tooltip = 'This network has two address formats';
      } else if (isBitcoinChain) {
        tooltip = 'This network has three address types';
      }

      let isShowBitcoinInfoButton = false;

      if (isBitcoinChain) {
        const accountTokenAddressList = getBitcoinTokenAddresses(item.slug, bitcoinAccountList);
        isShowBitcoinInfoButton = accountTokenAddressList.length > 1;
      }

      return (
        <AccountChainAddressItem
          infoButtonTooltip={tooltip}
          isShowInfoButton={isPolkadotUnifiedChain || isShowBitcoinInfoButton}
          item={item}
          key={`${item.slug}_${item.address}`}
          onPress={onShowQr(item)}
          onPressCopyButton={onCopyAddress(item)}
          onPressInfoButton={onPressInfoButton(item)}
          onPressQrButton={onShowQr(item)}
        />
      );
    },
    [
      bitcoinAccountList,
      checkIsPolkadotUnifiedChain,
      getBitcoinTokenAddresses,
      onPressInfoButton,
      onCopyAddress,
      onShowQr,
    ],
  );
  const searchFunction = useCallback((listItems: AccountChainAddress[], searchText: string) => {
    return listItems.filter(
      _item =>
        _item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        _item.address.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, []);

  useEffect(() => {
    if (addressQrModal.addressModalState.visible) {
      addressQrModal.setAddressQrModal(prev => {
        if (!prev || !TON_CHAINS.includes(prev.selectNetwork || '')) {
          return prev;
        }

        const targetAddress = items.find(i => i.slug === prev.selectNetwork)?.address;

        if (!targetAddress) {
          return prev;
        }

        return {
          ...prev,
          address: targetAddress,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, addressQrModal.addressModalState.visible]);

  return (
    <>
      <FullSizeSelectModal
        items={filteredItems}
        selectedValueMap={selectedValueMap}
        selectModalType={'single'}
        disabled={disabled}
        flatListStyle={{ paddingHorizontal: theme.padding }}
        renderSelected={renderSelected}
        placeholder={'Enter network name'}
        title={'Select address'}
        ref={accountSelectorRef}
        closeModalAfterSelect={closeModalAfterSelect}
        isShowContent={isShowContent}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        keyExtractor={item => `${item.slug}_${item.address}`}
        estimatedItemSize={60}
        isShowInput={isShowInput}>
        {children}
      </FullSizeSelectModal>
    </>
  );
};
