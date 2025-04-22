import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccountProxy } from '@subwallet/extension-base/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import useGetAccountChainAddresses from 'hooks/account/useGetAccountChainAddresses';
import { AccountChainAddress } from 'types/account';
import { AccountChainAddressItem } from 'components/common/SelectModal/parts/AccountChainAddressItem';
import i18n from 'utils/i18n/i18n';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppModalContext } from 'providers/AppModalContext';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import { useToast } from 'react-native-toast-notifications';
import { Keyboard, View } from 'react-native';
import { Search } from 'components/Search';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';

interface Props {
  accountProxy: AccountProxy;
}

export const AccountAddressList = ({ accountProxy }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const keyExtractor = (item: AccountChainAddress) => item.slug;
  const { addressQrModal, selectAddressFormatModal } = useContext(AppModalContext);
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const [searchString, setSearchString] = useState<string>('');
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return (
        item.name.toLowerCase().includes(searchString.toLowerCase()) ||
        item.address.toLowerCase().includes(searchString.toLowerCase())
      );
    });
  }, [items, searchString]);

  const onShowQr = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

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
        } else {
          onHandleTonAccountWarning(item.accountType, processFunction);
        }
      };
    },
    [addressQrModal, checkIsPolkadotUnifiedChain, navigation, onHandleTonAccountWarning, openSelectAddressFormatModal],
  );

  const onPressCopyBtn = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        Keyboard.dismiss();
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

        const processFunction = () => {
          toast.hideAll();
          toast.show(i18n.common.copiedToClipboard);
          Clipboard.setString(item.address);
        };

        if (isPolkadotUnifiedChain) {
          openSelectAddressFormatModal(item);
        } else {
          onHandleTonAccountWarning(item.accountType, processFunction);
        }
      };
    },
    [checkIsPolkadotUnifiedChain, onHandleTonAccountWarning, openSelectAddressFormatModal, toast],
  );

  const onPressInfoButton = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        Keyboard.dismiss();
        setTimeout(() => openSelectAddressFormatModal(item), 100);
      };
    },
    [openSelectAddressFormatModal],
  );

  const renderItem: ListRenderItem<AccountChainAddress> = ({ item }) => {
    const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

    return (
      <AccountChainAddressItem
        key={item.slug}
        item={item}
        onPressQrButton={onShowQr(item)}
        onPressCopyButton={onPressCopyBtn(item)}
        onPress={onShowQr(item)}
        isShowInfoButton={isPolkadotUnifiedChain}
        onPressInfoButton={onPressInfoButton(item)}
      />
    );
  };

  const renderEmptyList = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

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
    <View style={{ flex: 1, width: '100%' }}>
      <Search
        style={{ marginBottom: theme.marginXS }}
        placeholder={'Enter network name or address'}
        searchText={searchString}
        onSearch={setSearchString}
        onClearSearchString={() => setSearchString('')}
      />
      <>
        {filteredItems.length ? (
          <FlashList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={filteredItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            estimatedItemSize={60}
            keyboardShouldPersistTaps={'handled'}
          />
        ) : (
          renderEmptyList()
        )}
      </>
    </View>
  );
};
