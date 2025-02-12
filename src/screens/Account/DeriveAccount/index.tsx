import React, { useCallback, useContext, useMemo } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { DeviceEventEmitter, Platform } from 'react-native';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { AccountActions, AccountProxy } from '@subwallet/extension-base/types';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AppModalContext } from 'providers/AppModalContext';
import { SelectAccountItem } from 'components/common/SelectAccountItem';

export const DeriveAccount = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const { deriveModal } = useContext(AppModalContext);
  const filtered = useMemo(
    () => accountProxies.filter(({ accountActions }) => accountActions.includes(AccountActions.DERIVE)),
    [accountProxies],
  );

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  const onSelectAccount = useCallback(
    (account: AccountProxy): (() => void) => {
      return () => {
        deriveModal.setDeriveModalState({
          visible: true,
          navigation,
          proxyId: account.id,
          onCompleteCb: () => {
            navigation.navigate('Home');
          },
        });
      };
    },
    [deriveModal, navigation],
  );

  const onSelectItem = (account: AccountProxy) => {
    onPressSubmit(onSelectAccount(account))();
    Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountProxy>) => {
    return (
      <SelectAccountItem
        key={item.id}
        accountProxy={item}
        onSelectAccount={() => {
          onSelectItem(item);
        }}
        isShowEditBtn={false}
        isShowCopyBtn={false}
        showBottomPath={false}
        avatarSize={24}
        wrapperStyle={{ paddingVertical: theme.paddingSM }}
        isShowTypeIcon={false}
      />
    );
  };

  const searchFunction = useCallback((items: AccountProxy[], searchString: string) => {
    return items.filter(acc => {
      const isValidSearchByAddress = acc.accounts.some(account => {
        return account.address.toLowerCase().includes(searchString.toLowerCase());
      });
      return acc.name?.toLowerCase().includes(searchString.toLowerCase()) || isValidSearchByAddress;
    });
  }, []);

  return (
    <FlatListScreen
      items={filtered}
      renderListEmptyComponent={renderListEmptyComponent}
      title={i18n.header.selectAccount}
      renderItem={renderItem}
      onPressBack={() => navigation.goBack()}
      placeholder={i18n.placeholder.accountName}
      searchFunction={searchFunction}
    />
  );
};
