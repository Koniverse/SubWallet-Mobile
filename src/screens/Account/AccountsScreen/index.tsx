import { CurrentAccountInfo } from '@subwallet/extension-base/background/types';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, Keyboard, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Export, FileArrowDown, GitMerge, MagnifyingGlass, PlusCircle, Swatches, Trash } from 'phosphor-react-native';
import { AccountsScreenProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { forgetAccount, saveCurrentAccountAddress } from 'messaging/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { ModalRef } from 'types/modalRef';
import { Swipeable } from 'react-native-gesture-handler';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import DeleteModal from 'components/common/Modal/DeleteModal';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import useGoHome from 'hooks/screen/useGoHome';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AccountActions, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import createStylesheet from 'screens/Settings/AddressBook/style';
import { SelectAccountAllItem } from 'components/common/SelectAccountAllItem';
import { AccountChainAddressesSelector } from 'components/Modal/common/AccountChainAddressesSelector';

export enum AccountGroupType {
  ALL_ACCOUNT = 'all',
  MASTER_ACCOUNT = 'master_account',
  QR = 'qr',
  LEDGER = 'ledger',
  READ_ONLY = 'readonly',
  INJECTED = 'injected',
  UNKNOWN = 'unknown',
}

export const AccountGroupLabel: Record<AccountGroupType, string> = {
  [AccountGroupType.ALL_ACCOUNT]: 'All account',
  [AccountGroupType.MASTER_ACCOUNT]: 'Master account',
  [AccountGroupType.QR]: 'QR signer account',
  [AccountProxyType.LEDGER]: 'Ledger account',
  [AccountProxyType.READ_ONLY]: 'Watch-only account',
  [AccountProxyType.INJECTED]: 'Injected account',
  [AccountProxyType.UNKNOWN]: 'Unknown account',
};

const EARNING_SCREEN_LIST = [
  'EarningList',
  'EarningPoolList',
  'Earning',
  'Unbond',
  'ClaimReward',
  'CancelUnstake',
  'Withdraw',
];

export interface AccountProxyItem extends AccountProxy {
  group: AccountGroupType;
}

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

const searchFunction = (items: AccountProxyItem[], searchString: string) => {
  return items.filter(account => {
    const isValidSearchByAddress = account.accounts.some(acc => {
      return acc.address.toLowerCase().includes(searchString.toLowerCase());
    });
    return account.name?.toLowerCase().includes(searchString.toLowerCase()) || isValidSearchByAddress;
  });
};

function reorderAccounts(items: AccountProxyItem[]): AccountProxyItem[] {
  const accountMap: Record<string, AccountProxyItem> = {};
  const allChildren = new Set<string>();
  const result: AccountProxyItem[] = [];

  items.forEach(item => {
    accountMap[item.id] = item;

    if (item.children) {
      item.children.forEach(childId => allChildren.add(childId));
    }
  });

  items.forEach(item => {
    if (!allChildren.has(item.id)) {
      addWithChildren(item);
    }
  });

  function addWithChildren(item: AccountProxyItem) {
    result.push(item);

    if (item.children) {
      item.children.forEach(childId => {
        const child = accountMap[childId];

        if (child) {
          addWithChildren(child);
        }
      });
    }
  }

  return result;
}

export const AccountsScreen = ({
  route: {
    params: { pathName },
  },
}: AccountsScreenProps) => {
  const { accountProxies, currentAccountProxy } = useSelector((state: RootState) => state.accountState);

  const createAccountRef = useRef<ModalRef>();
  const importAccountRef = useRef<ModalRef>();
  const attachAccountRef = useRef<ModalRef>();
  const accountChainAddressSelectorRef = useRef<ModalRef>();
  let row = useRef<(Swipeable | null)[]>([]);
  let prevOpenedRow = useRef<Swipeable>(null);
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const goHome = useGoHome();
  const navigation = useNavigation<RootNavigationProps>();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedAccountProxy, setSelectedAccountProxy] = useState<{ name?: string; proxyId?: string } | undefined>();
  const [deleting, setDeleting] = useState(false);

  const accountProxyToGetAddresses = useMemo(() => {
    if (!selectedAccountProxy) {
      return undefined;
    }

    return accountProxies.find(ap => ap.id === selectedAccountProxy.proxyId);
  }, [accountProxies, selectedAccountProxy]);

  const listItems = useMemo<AccountProxyItem[]>(() => {
    let accountAll: AccountProxyItem | undefined;
    const result: AccountProxyItem[] = [];
    const masterAccounts: AccountProxyItem[] = [];
    const qrSignerAccounts: AccountProxyItem[] = [];
    const watchOnlyAccounts: AccountProxyItem[] = [];
    const ledgerAccounts: AccountProxyItem[] = [];
    const injectedAccounts: AccountProxyItem[] = [];
    const unknownAccounts: AccountProxyItem[] = [];

    accountProxies.forEach(ap => {
      if (isAccountAll(ap.id) || ap.accountType === AccountProxyType.ALL_ACCOUNT) {
        accountAll = { ...ap, group: AccountGroupType.ALL_ACCOUNT };

        return;
      }

      if (ap.accountType === AccountProxyType.SOLO || ap.accountType === AccountProxyType.UNIFIED) {
        masterAccounts.push({ ...ap, group: AccountGroupType.MASTER_ACCOUNT });
      } else if (ap.accountType === AccountProxyType.QR) {
        qrSignerAccounts.push({ ...ap, group: AccountGroupType.QR });
      } else if (ap.accountType === AccountProxyType.READ_ONLY) {
        watchOnlyAccounts.push({ ...ap, group: AccountGroupType.READ_ONLY });
      } else if (ap.accountType === AccountProxyType.LEDGER) {
        ledgerAccounts.push({ ...ap, group: AccountGroupType.LEDGER });
      } else if (ap.accountType === AccountProxyType.INJECTED) {
        injectedAccounts.push({ ...ap, group: AccountGroupType.INJECTED });
      } else if (ap.accountType === AccountProxyType.UNKNOWN) {
        unknownAccounts.push({ ...ap, group: AccountGroupType.UNKNOWN });
      }
    });

    if (masterAccounts.length) {
      result.push(...reorderAccounts(masterAccounts));
    }

    if (qrSignerAccounts.length) {
      result.push(...qrSignerAccounts);
    }

    if (watchOnlyAccounts.length) {
      result.push(...watchOnlyAccounts);
    }

    if (ledgerAccounts.length) {
      result.push(...ledgerAccounts);
    }

    if (injectedAccounts.length) {
      result.push(...ledgerAccounts);
    }

    if (unknownAccounts.length) {
      result.push(...unknownAccounts);
    }

    if (result.length > 1 && accountAll) {
      result.unshift(accountAll);
    }

    return result;
  }, [accountProxies]);

  const groupBy = useCallback((item: AccountProxyItem) => {
    return `${AccountGroupLabel[item.group]}`;
  }, []);

  const renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null = useCallback(
    (item: string) => {
      if (
        item.split('|')[0] === AccountGroupLabel[AccountGroupType.ALL_ACCOUNT] ||
        item.split('|')[0] === AccountGroupLabel[AccountGroupType.MASTER_ACCOUNT]
      ) {
        return <></>;
      }

      return (
        <View key={item} style={stylesheet.sectionHeaderContainer}>
          <Typography.Text size={'sm'} style={stylesheet.sectionHeaderTitle}>
            {`${item.split('|')[0]} `}
          </Typography.Text>
        </View>
      );
    },
    [stylesheet.sectionHeaderContainer, stylesheet.sectionHeaderTitle],
  );

  const grouping = useMemo(() => {
    return { groupBy, sortSection: undefined, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

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

  const onDelete = useCallback(() => {
    if (selectedAddress) {
      setDeleting(true);
      forgetAccount(selectedAddress)
        .then(() => {
          goHome();
        })
        .catch((e: Error) => {
          toast.show(e.message, { type: 'danger' });
        })
        .finally(() => {
          setDeleting(false);
        });
    }
  }, [selectedAddress, goHome, toast]);

  const closeOpenedRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow.current !== row.current?.[index]) {
      prevOpenedRow.current?.close();
    }
    prevOpenedRow = { current: row.current?.[index] };
  };

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
    setVisible: setDeleteVisible,
  } = useConfirmModal(onDelete);

  const selectAccount = useCallback(
    (accountProxy: AccountProxy) => {
      return () => {
        const targetAccountProxy = accountProxies.find(ap => ap.id === accountProxy.id);
        if (targetAccountProxy) {
          const accountInfo = {
            address: targetAccountProxy.id,
          } as CurrentAccountInfo;

          saveCurrentAccountAddress(accountInfo).catch(e => {
            console.error('There is a problem when set Current Account', e);
          });
        }

        if (pathName === 'TokenGroupsDetail') {
          // need 2x goBack() for going back to TokenGroups because of specific reason
          navigation.goBack();
          navigation.goBack();
        } else if (pathName === 'SendFund' || pathName === 'BuyToken') {
          navigation.navigate('Home', {
            screen: 'Main',
            params: { screen: 'Tokens', params: { screen: 'TokenGroups' } },
          });
          navigation.goBack();
        } else if (pathName && EARNING_SCREEN_LIST.includes(pathName)) {
          navigation.navigate('Home', {
            screen: 'Main',
            params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 1 } } },
          });
        } else {
          navigation.navigate('Home');
        }
      };
    },
    [pathName, accountProxies, navigation],
  );

  const renderRightSwipeActions = useCallback(
    (ap: AccountProxy, index: number) => {
      const showDeriveButton = !!ap?.children?.length;
      return () => (
        <View style={stylesheet.rightSwipeActionsStyle}>
          {showDeriveButton && (
            <Button
              shape={'circle'}
              style={{ backgroundColor: 'rgba(217, 163, 62, 0.1)' }}
              type={'ghost'}
              icon={<Icon phosphorIcon={GitMerge} size={'sm'} iconColor={theme['gold-6']} />}
              size={'xs'}
              onPress={() => {
                navigation.navigate('EditAccount', {
                  address: ap.id,
                  name: ap.name || '',
                  requestViewDerivedAccounts: true,
                  requestViewDerivedAccountDetails: false,
                });
              }}
            />
          )}
          <Button
            shape={'circle'}
            style={{ backgroundColor: 'rgba(191, 22, 22, 0.1)' }}
            type={'ghost'}
            icon={<Icon phosphorIcon={Trash} size={'sm'} iconColor={theme.colorError} />}
            size={'xs'}
            onPress={() => {
              Keyboard.dismiss();
              row.current?.[index]?.close();
              setSelectedAddress(ap.id);
              onPressDelete();
            }}
            loading={deleting}
          />
        </View>
      );
    },
    [deleting, navigation, onPressDelete, stylesheet.rightSwipeActionsStyle, theme],
  );

  const onPressCopyBtn = useCallback((accountProxy: AccountProxy) => {
    return () => {
      setSelectedAccountProxy({ name: accountProxy.name, proxyId: accountProxy.id });
      setTimeout(() => accountChainAddressSelectorRef.current?.onOpenModal(), 100);
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AccountProxyItem>) => {
      const isAllAccount = isAccountAll(item.id);

      return (
        <Swipeable
          key={item.id}
          enabled={!isAllAccount}
          ref={ref => (row.current[index] = ref)}
          friction={2}
          leftThreshold={80}
          rightThreshold={40}
          onSwipeableWillOpen={() => closeOpenedRow(index)}
          renderRightActions={renderRightSwipeActions(item, index)}>
          {isAllAccount ? (
            <SelectAccountAllItem
              isSelected={item.id === currentAccountProxy?.id}
              onPress={selectAccount(item)}
              accountProxies={accountProxies}
            />
          ) : (
            <SelectAccountItem
              key={item.id}
              accountProxy={item}
              isSelected={item.id === currentAccountProxy?.id}
              isAllAccount={isAllAccount}
              onPressCopyBtn={onPressCopyBtn(item)}
              onSelectAccount={selectAccount(item)}
              onPressDetailBtn={() => {
                navigation.navigate('EditAccount', {
                  address: item.id,
                  name: item.name || '',
                  requestViewDerivedAccounts: false,
                  requestViewDerivedAccountDetails: false,
                });
              }}
            />
          )}
        </Swipeable>
      );
    },
    [accountProxies, currentAccountProxy?.id, navigation, onPressCopyBtn, renderRightSwipeActions, selectAccount],
  );

  const onPressFooterBtn = (action: () => void) => {
    Keyboard.dismiss();
    setTimeout(action, 200);
  };

  const renderFooterComponent = () => {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          ...MarginBottomForSubmitButton,
          marginTop: 16,
          flexDirection: 'row',
        }}>
        <Button
          style={{ marginRight: 12 }}
          block
          icon={<Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          externalTextStyle={{ flex: 1 }}
          onPress={() => onPressFooterBtn(() => createAccountRef?.current?.onOpenModal())}>
          {i18n.buttonTitles.createANewAcc}
        </Button>
        <Button
          style={{ marginRight: 12 }}
          icon={<Icon phosphorIcon={FileArrowDown} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => onPressFooterBtn(() => importAccountRef?.current?.onOpenModal())}
        />
        <Button
          icon={<Icon phosphorIcon={Swatches} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => onPressFooterBtn(() => attachAccountRef?.current?.onOpenModal())}
        />
      </View>
    );
  };

  const closeAccountChainAddressesModal = useCallback(() => {
    accountChainAddressSelectorRef.current?.onCloseModal();
    setSelectedAccountProxy(undefined);
  }, []);

  return (
    <>
      <FlatListScreen
        style={{ flex: 1 }}
        onPressBack={() => navigation.goBack()}
        title={i18n.header.selectAccount}
        grouping={grouping}
        items={listItems}
        renderItem={renderItem}
        renderListEmptyComponent={renderListEmptyComponent}
        searchFunction={searchFunction}
        autoFocus={false}
        loading={!isReady}
        afterListItem={renderFooterComponent()}
        placeholder={i18n.placeholder.accountName}
        estimatedItemSize={64}
        keyExtractor={item => {
          return `${item.id}`;
        }}
        rightIconOption={{
          icon: ({ color }) => <Icon phosphorIcon={Export} weight={'fill'} iconColor={color} size={'md'} />,
          onPress: () => navigation.navigate('ExportAllAccount'),
        }}
      />

      <AccountCreationArea
        createAccountRef={createAccountRef}
        importAccountRef={importAccountRef}
        attachAccountRef={attachAccountRef}
        allowToShowSelectType={true}
      />

      {accountProxyToGetAddresses && (
        <AccountChainAddressesSelector
          accountProxy={accountProxyToGetAddresses}
          selectedValueMap={{}}
          onCancel={closeAccountChainAddressesModal}
          accountSelectorRef={accountChainAddressSelectorRef}
        />
      )}

      <DeleteModal
        title={i18n.header.removeThisAcc}
        visible={deleteVisible}
        message={i18n.removeAccount.removeAccountMessage}
        onCancelModal={onCancelDelete}
        onCompleteModal={onCompleteDeleteModal}
        setVisible={setDeleteVisible}
      />
    </>
  );
};
