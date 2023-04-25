import { AccountJson } from '@subwallet/extension-base/background/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleProp,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Account } from 'components/Account';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { IconButton } from 'components/IconButton';
import { DotsThree, FileArrowDown, Plus, PlusCircle, Swatches } from 'phosphor-react-native';
import { Warning } from 'components/Warning';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { saveCurrentAccountAddress, triggerAccountsSubscription } from 'messaging/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { Divider } from 'components/Divider';
import { findAccountByAddress } from 'utils/index';
import { CurrentAccountInfo } from '@subwallet/extension-base/background/KoniTypes';
import { Button, Icon } from 'components/design-system-ui';
import { AccountCreationArea } from 'components/common/AccountCreationArea';
import { updatePasswordModalState, updateSelectedAction } from 'stores/PasswordModalState';
import { SelectedActionType } from 'stores/types';

const accountsWrapper: StyleProp<any> = {
  flex: 1,
};
const accountItemContainer: StyleProp<any> = {
  paddingHorizontal: 16,
};

export const AccountsScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { accounts, isLocked } = useSelector((state: RootState) => state.accountState);
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccount?.address);
  const [selectedAction, setSelectedAction] = useState<SelectedActionType | undefined>(undefined);
  const [importAccountModalVisible, setImportAccountModalVisible] = useState<boolean>(false);
  const [attachAccountModalVisible, setAttachAccountModalVisible] = useState<boolean>(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let event: EmitterSubscription;
    if (selectedAction) {
      event = DeviceEventEmitter.addListener(selectedAction, () => {
        if (selectedAction === 'createAcc') {
          setCreateAccountModalVisible(true);
        } else if (selectedAction === 'importAcc') {
          setImportAccountModalVisible(true);
        } else if (selectedAction === 'attachAcc') {
          setAttachAccountModalVisible(true);
        }
      });
    }

    return () => {
      selectedAction && event.remove();
    };
  }, [selectedAction]);

  const renderListEmptyComponent = () => {
    return <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noAccountText} isDanger={false} />;
  };

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

  const onPressActionButton = (action: SelectedActionType) => {
    if (isLocked) {
      dispatch(updatePasswordModalState(true));
    } else {
      if (action === 'createAcc') {
        setCreateAccountModalVisible(true);
      } else if (action === 'importAcc') {
        setImportAccountModalVisible(true);
      } else if (action === 'attachAcc') {
        setAttachAccountModalVisible(true);
      }
    }
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
          onPress={() => {
            setSelectedAction('createAcc');
            dispatch(updateSelectedAction('createAcc'));
            onPressActionButton('createAcc');
          }}>
          {'Create new account'}
        </Button>
        <Button
          style={{ marginRight: 12 }}
          icon={<Icon phosphorIcon={FileArrowDown} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => {
            setSelectedAction('importAcc');
            dispatch(updateSelectedAction('importAcc'));
            onPressActionButton('importAcc');
          }}
        />
        <Button
          icon={<Icon phosphorIcon={Swatches} size={'lg'} weight={'fill'} />}
          type={'secondary'}
          onPress={() => {
            setSelectedAction('attachAcc');
            dispatch(updateSelectedAction('attachAcc'));
            onPressActionButton('attachAcc');
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
