import { AccountJson } from '@subwallet/extension-base/background/types';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FileArrowDown, PlusCircle, Swatches } from 'phosphor-react-native';
import { Warning } from 'components/Warning';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { saveCurrentAccountAddress, triggerAccountsSubscription } from 'messaging/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { findAccountByAddress } from 'utils/index';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { Button, Icon } from 'components/design-system-ui';
import { AccountCreationArea } from 'components/common/Account/AccountCreationArea';

const accountsWrapper: StyleProp<any> = {
  flex: 1,
  paddingTop: 16,
};

const renderListEmptyComponent = () => {
  return <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noAccountText} isDanger={false} />;
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

          saveCurrentAccountAddress(accountInfo, () => {
            triggerAccountsSubscription().catch(e => {
              console.error('There is a problem when trigger Accounts Subscription', e);
            });
          }).catch(e => {
            console.error('There is a problem when set Current Account', e);
          });
        }
      }

      if (navigation.getState()?.routes.length >= 3) {
        // back to previous 3rd screen
        navigation.pop(2);
      } else {
        navigation.navigate('Home');
      }
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
    <SubScreenContainer navigation={navigation} title={i18n.title.accounts}>
      <View style={accountsWrapper}>
        <FlatList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps={'handled'}
          data={accounts}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.address}
        />
        {renderFooterComponent()}

        <AccountCreationArea
          allowToShowSelectType={true}
          createAccountModalVisible={createAccountModalVisible}
          importAccountModalVisible={importAccountModalVisible}
          attachAccountModalVisible={attachAccountModalVisible}
          onChangeCreateAccountModalVisible={setCreateAccountModalVisible}
          onChangeImportAccountModalVisible={setImportAccountModalVisible}
          onChangeAttachAccountModalVisible={setAttachAccountModalVisible}
        />
      </View>
    </SubScreenContainer>
  );
};
