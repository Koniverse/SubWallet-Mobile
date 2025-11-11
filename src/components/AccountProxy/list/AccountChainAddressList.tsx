import { AccountChainAddress, AccountInfoType, AccountTokenAddress } from 'types/account';
import { AccountProxy } from '@subwallet/extension-base/types';
import useGetAccountChainAddresses from 'hooks/account/useGetAccountChainAddresses';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getBitcoinAddressInfo, isBitcoinAddress } from '@subwallet/keyring';
import { BitcoinAddressType } from '@subwallet/keyring/types';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { AppModalContext } from 'providers/AppModalContext';
import { AccountChainAddressItem } from 'components/common/SelectModal/parts/AccountChainAddressItem';
import useCopyClipboard from 'hooks/common/useCopyClipboard';
import { useToast } from 'react-native-toast-notifications';
import { EmptyList } from 'components/EmptyList';
import useGetBitcoinAccounts from 'hooks/common/useGetBitcoinAccounts';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Search } from 'components/Search';
import { Keyboard, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

interface Props {
  accountProxy: AccountProxy;
  isInModal?: boolean;
  modalProps?: {
    onCancel: VoidFunction;
  };
}

interface BitcoinAccountsByNetwork {
  mainnet: AccountInfoType[];
  testnet: AccountInfoType[];
}

export const AccountChainAddressList = ({ accountProxy }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const getBitcoinAccounts = useGetBitcoinAccounts();
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const { addressQrModal, selectAddressFormatModal, accountTokenAddressModal } = useContext(AppModalContext);
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { copyToClipboard } = useCopyClipboard();
  const { show } = useToast();
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');

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
      // --- Step 1: filter Bitcoin address ---
      if (isBitcoinAddress(item.address)) {
        const addressInfo = getBitcoinAddressInfo(item.address);

        if (addressInfo.network === 'mainnet' && soloBitcoinAccount.mainnet.length > 1) {
          if (![BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type)) {
            return false;
          }
        } else if (addressInfo.network === 'testnet' && soloBitcoinAccount.testnet.length > 1) {
          if (![BitcoinAddressType.p2wpkh, BitcoinAddressType.p2wsh].includes(addressInfo.type)) {
            return false;
          }
        }
      }

      // --- Step 2: filter searchString ---
      const lowerSearch = searchString.toLowerCase();
      return item.name.toLowerCase().includes(lowerSearch) || item.address.toLowerCase().includes(lowerSearch);
    });
  }, [items, searchString, soloBitcoinAccount.mainnet.length, soloBitcoinAccount.testnet.length]);

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
            isOpenFromAccountDetailScreen: true,
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
        Keyboard.dismiss();
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
            Keyboard.dismiss();
            delayActionAfterDismissKeyboard(() => openAccountTokenAddressModal(accountTokenAddressList));
            return;
          }
        }

        Keyboard.dismiss();
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

  const renderEmptyList = useCallback(() => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
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

  const keyExtractor = (item: AccountChainAddress) => `${item.slug}_${item.address}`;

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Search
        style={{ marginBottom: theme.marginXS }}
        placeholder={'Enter account name or address'}
        searchText={searchString}
        onSearch={setSearchString}
        onClearSearchString={() => setSearchString('')}
      />

      {filteredItems.length ? (
        <FlashList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews
          data={filteredItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={52}
        />
      ) : (
        renderEmptyList()
      )}
    </View>
  );
};

export default AccountChainAddressList;
