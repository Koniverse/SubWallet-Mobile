import { AccountJson } from '@subwallet/extension-base/background/types';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import React, { useCallback, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FileArrowDown, MagnifyingGlass, PlusCircle, Swatches } from 'phosphor-react-native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { saveCurrentAccountAddress, triggerAccountsSubscription } from 'messaging/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { findAccountByAddress } from 'utils/index';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { Button, Icon } from 'components/design-system-ui';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={'No results found'}
      message={'Please change your search criteria try again'}
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

export const AccountsScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccount?.address);

  const [importAccountModalVisible, setImportAccountModalVisible] = useState<boolean>(false);
  const [attachAccountModalVisible, setAttachAccountModalVisible] = useState<boolean>(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState<boolean>(false);

  const selectAccount = useCallback(
    (accAddress: string) => {
      if (currentAccountAddress !== accAddress) {
        const accountByAddress = findAccountByAddress(accounts, accAddress);

        if (accountByAddress) {
          const accountInfo = {
            address: accAddress,
          } as CurrentAccountInfo;

          saveCurrentAccountAddress(accountInfo, () => {}).catch(e => {
            console.error('There is a problem when set Current Account', e);
          });
        }
      }

      navigation.navigate('Home');
    },
    [currentAccountAddress, navigation, accounts],
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
          onPress={() => {
            setCreateAccountModalVisible(true);
          }}>
          {'Create new account'}
        </Button>
        <Button
          style={{ marginRight: 12 }}
          icon={<Icon phosphorIcon={FileArrowDown} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => {
            setImportAccountModalVisible(true);
          }}
        />
        <Button
          icon={<Icon phosphorIcon={Swatches} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => {
            setAttachAccountModalVisible(true);
          }}
        />
      </View>
    );
  };

  return (
    <>
      <FlatListScreen
        style={{ flex: 1 }}
        title={i18n.title.accounts}
        items={accounts}
        renderItem={renderItem}
        renderListEmptyComponent={renderListEmptyComponent}
        searchFunction={searchFunction}
        afterListItem={renderFooterComponent()}
      />

      <AccountCreationArea
        allowToShowSelectType={true}
        createAccountModalVisible={createAccountModalVisible}
        importAccountModalVisible={importAccountModalVisible}
        attachAccountModalVisible={attachAccountModalVisible}
        onChangeCreateAccountModalVisible={setCreateAccountModalVisible}
        onChangeImportAccountModalVisible={setImportAccountModalVisible}
        onChangeAttachAccountModalVisible={setAttachAccountModalVisible}
      />
    </>
  );
};
