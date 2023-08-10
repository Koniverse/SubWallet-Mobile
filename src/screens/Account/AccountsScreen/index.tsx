import { AccountJson } from '@subwallet/extension-base/background/types';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import React, { useCallback, useMemo, useRef } from 'react';
import { Keyboard, ListRenderItemInfo, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FileArrowDown, MagnifyingGlass, PlusCircle, Swatches } from 'phosphor-react-native';
import { AccountsScreenProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { saveCurrentAccountAddress } from 'messaging/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { findAccountByAddress } from 'utils/index';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { Button, Icon } from 'components/design-system-ui';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { ModalRef } from 'types/modalRef';

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

const searchFunction = (items: AccountJson[], searchString: string) => {
  return items.filter(
    account =>
      account.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      account.address.toLowerCase().includes(searchString.toLowerCase()),
  );
};

export const AccountsScreen = ({
  route: {
    params: { pathName },
  },
}: AccountsScreenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const fullAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccount?.address);
  const accounts = useMemo(() => {
    if (fullAccounts.length > 2) {
      return fullAccounts;
    }

    return fullAccounts.filter(a => !isAccountAll(a.address));
  }, [fullAccounts]);

  const createAccountRef = useRef<ModalRef>();
  const importAccountRef = useRef<ModalRef>();
  const attachAccountRef = useRef<ModalRef>();

  const selectAccount = useCallback(
    (accAddress: string) => {
      if (currentAccountAddress !== accAddress) {
        const accountByAddress = findAccountByAddress(accounts, accAddress);

        if (accountByAddress) {
          const accountInfo = {
            address: accAddress,
          } as CurrentAccountInfo;

          saveCurrentAccountAddress(accountInfo).catch(e => {
            console.error('There is a problem when set Current Account', e);
          });
        }
      }

      if (pathName === 'TokenGroupsDetail') {
        // need 2x goBack() for going back to TokenGroups because of specific reason
        navigation.goBack();
        navigation.goBack();
      } else if (pathName === 'SendFund') {
        navigation.navigate('Home', { screen: 'Tokens', params: { screen: 'TokenGroups' } });
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    },
    [currentAccountAddress, pathName, accounts, navigation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountJson>) => {
      const isAllAccount = isAccountAll(item.address);

      return (
        <SelectAccountItem
          key={item.address}
          address={item.address}
          accountName={item.name}
          isSelected={currentAccountAddress === item.address}
          isAllAccount={isAllAccount}
          onSelectAccount={selectAccount}
          onPressDetailBtn={() => {
            navigation.navigate('EditAccount', { address: item.address, name: item.name || '' });
          }}
        />
      );
    },
    [currentAccountAddress, navigation, selectAccount],
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

  return (
    <>
      <FlatListScreen
        style={{ flex: 1 }}
        onPressBack={() => navigation.goBack()}
        title={i18n.header.selectAccount}
        items={accounts}
        renderItem={renderItem}
        renderListEmptyComponent={renderListEmptyComponent}
        searchFunction={searchFunction}
        autoFocus={false}
        afterListItem={renderFooterComponent()}
        placeholder={i18n.placeholder.accountName}
      />

      <AccountCreationArea
        createAccountRef={createAccountRef}
        importAccountRef={importAccountRef}
        attachAccountRef={attachAccountRef}
        allowToShowSelectType={true}
      />
    </>
  );
};
