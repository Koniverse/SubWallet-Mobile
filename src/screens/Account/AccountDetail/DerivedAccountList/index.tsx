import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AccountProxy } from '@subwallet/extension-base/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import { AccountChainAddressesSelector } from 'components/Modal/common/AccountChainAddressesSelector';
import { ModalRef } from 'types/modalRef';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  accountProxy: AccountProxy;
}

export const DerivedAccountList = ({ accountProxy }: Props) => {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const navigation = useNavigation<RootNavigationProps>();
  const [accountProxyToCopyAddresses, setAccountProxyToCopyAddresses] = useState<AccountProxy>();
  const accountChainAddressSelectorRef = useRef<ModalRef>();
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
  const keyExtractor = (item: AccountProxy) => item.id;

  const onPressCopyBtn = useCallback((item: AccountProxy) => {
    return () => {
      setAccountProxyToCopyAddresses(item);
      setTimeout(() => accountChainAddressSelectorRef.current?.onOpenModal(), 100);
    };
  }, []);

  const onPressDetailBtn = useCallback(
    (item: AccountProxy) => {
      return () => {
        navigation.navigate('EditAccount', { address: item.id, name: item.name || '' });
      };
    },
    [navigation],
  );

  const closeAccountChainAddressesModal = useCallback(() => {
    accountChainAddressSelectorRef.current?.onCloseModal();
    setAccountProxyToCopyAddresses(undefined);
  }, []);

  const renderItem: ListRenderItem<AccountProxy> = ({ item }) => {
    return (
      <SelectAccountItem
        accountProxy={item}
        onPressCopyBtn={onPressCopyBtn(item)}
        onPressDetailBtn={onPressDetailBtn(item)}
        showDerivedPath={!!item.parentId}
      />
    );
  };

  return (
    <>
      <FlashList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={52}
      />

      {accountProxyToCopyAddresses && (
        <AccountChainAddressesSelector
          accountProxy={accountProxyToCopyAddresses}
          selectedValueMap={{}}
          onCancel={closeAccountChainAddressesModal}
          accountSelectorRef={accountChainAddressSelectorRef}
        />
      )}
    </>
  );
};
