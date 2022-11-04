import { AccountJson } from '@subwallet/extension-base/background/types';
import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, TouchableOpacity, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Account } from 'components/Account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { IconButton } from 'components/IconButton';
import { DotsThree, Plus } from 'phosphor-react-native';
import { Warning } from 'components/Warning';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { updateCurrentAccountAddress } from '../messaging';
import { updateAccountsWaitingStatus } from 'stores/updater';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { Divider } from 'components/Divider';
import AddAccountModal from 'components/Modal/AddAccountModal';

const accountsWrapper: StyleProp<any> = {
  flex: 1,
};
const accountItemContainer: StyleProp<any> = {
  paddingHorizontal: 16,
};

export const AccountsScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const renderListEmptyComponent = () => {
    return <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noAccountText} isDanger={false} />;
  };

  const selectAccount = useCallback(
    (accAddress: string) => {
      if (currentAccountAddress !== accAddress) {
        updateAccountsWaitingStatus(true);
        updateCurrentAccountAddress(accAddress).catch(console.error);
      }

      if (navigation.getState()?.routes.length >= 3) {
        // back to previous 3rd screen
        navigation.pop(2);
      } else {
        navigation.navigate('Home');
      }
    },
    [navigation, currentAccountAddress],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountJson>) => {
      return (
        <TouchableOpacity style={accountItemContainer} onPress={() => selectAccount(item.address)}>
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Account
              key={item.address}
              name={item.name || ''}
              address={item.address}
              showCopyBtn={false}
              selectAccount={() => {
                selectAccount(item.address);
              }}
              isSelected={currentAccountAddress === item.address}
              showSubIcon={true}
            />

            {!isAccountAll(item.address) && (
              <IconButton
                icon={DotsThree}
                color={ColorMap.disabled}
                onPress={() => {
                  navigation.navigate('EditAccount', { address: item.address, name: item.name || '' });
                }}
              />
            )}
          </View>
          <Divider style={{ paddingLeft: 56 }} color={ColorMap.dark2} />
        </TouchableOpacity>
      );
    },
    [currentAccountAddress, navigation, selectAccount],
  );

  const onCreateAccount = useCallback(() => {
    setModalVisible(true);
  }, []);

  const renderFooterComponent = useCallback(() => {
    return (
      <View style={{ paddingHorizontal: 16, ...MarginBottomForSubmitButton, marginTop: 16 }}>
        <SubmitButton
          backgroundColor={ColorMap.dark2}
          title={i18n.common.addOrConnectAccount}
          onPress={onCreateAccount}
        />
      </View>
    );
  }, [onCreateAccount]);

  const onHideModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.title.accounts}
      rightIcon={Plus}
      onPressRightIcon={onCreateAccount}>
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

        <AddAccountModal onHideModal={onHideModal} modalVisible={modalVisible} />
      </View>
    </SubScreenContainer>
  );
};
