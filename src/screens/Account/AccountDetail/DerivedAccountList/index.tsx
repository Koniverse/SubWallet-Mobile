import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountActions, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import { AccountChainAddressesSelector } from 'components/Modal/common/AccountChainAddressesSelector';
import { ModalRef } from 'types/modalRef';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { View } from 'react-native';
import { Search } from 'components/Search';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  accountProxy: AccountProxy;
}

export const DerivedAccountList = ({ accountProxy }: Props) => {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const navigation = useNavigation<RootNavigationProps>();
  const [selectedAccountProxy, setSelectedAccountProxy] = useState<{ name?: string; proxyId?: string } | undefined>();
  const accountChainAddressSelectorRef = useRef<ModalRef>();
  const [searchString, setSearchString] = useState<string>('');
  const theme = useSubWalletTheme().swThemes;

  const accountProxyToGetAddresses = useMemo(() => {
    if (!selectedAccountProxy) {
      return undefined;
    }

    return accountProxies.find(ap => ap.id === selectedAccountProxy.proxyId);
  }, [accountProxies, selectedAccountProxy]);

  const items = useMemo<AccountProxy[]>(() => {
    const result: AccountProxy[] = [];

    if (!accountProxy?.children?.length) {
      return [];
    }

    accountProxy.children.forEach(apId => {
      const item = accountProxies.find(ap => ap.id === apId);

      if (item) {
        result.push(item);
      }
    });

    return result;
  }, [accountProxies, accountProxy.children]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const isValidSearchByAddress = item.accounts.some(account => {
        return account.address.toLowerCase().includes(searchString.toLowerCase());
      });
      if (item.accounts.length === 1) {
        return (
          item.name.toLowerCase().includes(searchString.toLowerCase()) ||
          item.accounts[0].address.toLowerCase().includes(searchString.toLowerCase())
        );
      }

      return item.name.toLowerCase().includes(searchString.toLowerCase()) || isValidSearchByAddress;
    });
  }, [items, searchString]);

  const keyExtractor = (item: AccountProxy) => item.id;

  const onPressCopyBtn = useCallback((item: AccountProxy) => {
    return () => {
      setSelectedAccountProxy({ name: item.name, proxyId: item.id });
      setTimeout(() => accountChainAddressSelectorRef.current?.onOpenModal(), 100);
    };
  }, []);

  const onPressDetailBtn = useCallback(
    (item: AccountProxy) => {
      return () => {
        navigation.navigate('EditAccount', {
          address: item.id,
          name: item.name || '',
          requestViewDerivedAccountDetails: true,
        });
      };
    },
    [navigation],
  );

  const closeAccountChainAddressesModal = useCallback(() => {
    accountChainAddressSelectorRef.current?.onCloseModal();
    setSelectedAccountProxy(undefined);
  }, []);

  const renderEmptyList = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  const renderItem: ListRenderItem<AccountProxy> = ({ item }) => {
    return (
      <SelectAccountItem
        accountProxy={item}
        onPressCopyBtn={onPressCopyBtn(item)}
        onPressDetailBtn={onPressDetailBtn(item)}
        showDerivedPath={!!item.parentId}
        wrapperStyle={{ marginHorizontal: 0 }}
      />
    );
  };

  useEffect(() => {
    const selectedAccount = accountProxies.find(account => account.name === selectedAccountProxy?.name);
    const isSoloAccount = selectedAccount?.accountType === AccountProxyType.SOLO;
    const hasTonChangeWalletContractVersion = selectedAccount?.accountActions.includes(
      AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION,
    );

    if (isSoloAccount && hasTonChangeWalletContractVersion) {
      setSelectedAccountProxy({ name: selectedAccount?.name, proxyId: selectedAccount?.id });
      setTimeout(() => accountChainAddressSelectorRef.current?.onOpenModal(), 100);
    }
  }, [accountProxies, selectedAccountProxy?.name]);

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

      {accountProxyToGetAddresses && (
        <AccountChainAddressesSelector
          accountProxy={accountProxyToGetAddresses}
          selectedValueMap={{}}
          onCancel={closeAccountChainAddressesModal}
          accountSelectorRef={accountChainAddressSelectorRef}
        />
      )}
    </View>
  );
};
