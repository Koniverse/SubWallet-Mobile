import React, { useCallback, useContext, useMemo, useState } from 'react';
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
import { View } from 'react-native';
import { Search } from 'components/Search';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  accountProxy: AccountProxy;
}

export const AccountAddressList = ({ accountProxy }: Props) => {
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const onHandleTonAccountWarning = useHandleTonAccountWarning();
  const keyExtractor = (item: AccountChainAddress) => item.slug;
  const { addressQrModal } = useContext(AppModalContext);
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const [searchString, setSearchString] = useState<string>('');

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
        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            visible: true,
            address: item.address,
            selectNetwork: item.slug,
            onBack: addressQrModal.hideAddressQrModal,
          });
        };

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [addressQrModal, onHandleTonAccountWarning],
  );

  const onPressCopyBtn = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const processFunction = () => {
          toast.hideAll();
          toast.show(i18n.common.copiedToClipboard);
          Clipboard.setString(item.address);
        };

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [onHandleTonAccountWarning, toast],
  );

  const renderItem: ListRenderItem<AccountChainAddress> = ({ item }) => {
    return (
      <AccountChainAddressItem
        key={item.slug}
        item={item}
        onPressQrButton={onShowQr(item)}
        onPressCopyButton={onPressCopyBtn(item)}
        onPress={onShowQr(item)}
      />
    );
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Search
        style={{ marginBottom: theme.marginXS }}
        placeholder={'Enter network name or address'}
        searchText={searchString}
        onSearch={setSearchString}
        onClearSearchString={() => setSearchString('')}
      />
      <FlashList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={filteredItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={60}
      />
    </View>
  );
};
