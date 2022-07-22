import React, { useState } from 'react';
import { FlatList, StyleProp, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Account } from 'components/Account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { IconButton } from 'components/IconButton';
import { Article, DotsThree, FileArrowUp, LockKey, Plus, UserCirclePlus } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { RootNavigationProps, RootStackParamList } from 'types/routes';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import i18n from 'utils/i18n/i18n';
import { SelectImportAccountModal } from 'screens/FirstScreen/SelectImportAccountModal';
import { AccountActionType } from 'types/ui-types';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { SelectAccountTypeModal } from 'components/SelectAccountTypeModal';
import { EVM_ACCOUNT_TYPE, HIDE_MODAL_DURATION, SUBSTRATE_ACCOUNT_TYPE } from '../constant';

const accountsWrapper: StyleProp<any> = {
  flex: 1,
};
const accountItemContainer: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 11,
  flex: 1,
};

const accountItemSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  borderBottomStyle: 'solid',
  marginLeft: 50,
};

export const AccountsScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;
  const theme = useSubWalletTheme().colors;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<keyof RootStackParamList | null>(null);
  const [selectTypeModalVisible, setSelectTypeModalVisible] = useState<boolean>(false);
  const SECRET_TYPE: AccountActionType[] = [
    {
      icon: UserCirclePlus,
      title: i18n.common.createWalletName,
      onCLickButton: () => {
        setSelectedAction('CreateAccount');
        setModalVisible(false);
        setTimeout(() => {
          setSelectTypeModalVisible(true);
        }, HIDE_MODAL_DURATION);
      },
    },
    {
      icon: Article,
      title: i18n.common.importSecretPhrase,
      onCLickButton: () => {
        setSelectedAction('ImportSecretPhrase');
        setModalVisible(false);
        setTimeout(() => {
          setSelectTypeModalVisible(true);
        }, HIDE_MODAL_DURATION);
      },
    },
    {
      icon: LockKey,
      title: i18n.common.importEVMPrivateKey,
      onCLickButton: () => {
        navigation.navigate('ImportPrivateKey');
        setModalVisible(false);
      },
    },
    {
      icon: FileArrowUp,
      title: i18n.common.importFromJson,
      onCLickButton: () => {
        navigation.navigate('RestoreJson');
        setModalVisible(false);
      },
    },
  ];

  const onSelectSubstrateAccount = () => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: SUBSTRATE_ACCOUNT_TYPE });
  };

  const onSelectEvmAccount = () => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: EVM_ACCOUNT_TYPE });
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.warningMessage.noAccountText} isDanger={false} />;
  };

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <View style={accountItemContainer}>
        <Account key={item.address} name={item.name || ''} address={item.address} showCopyBtn={false} />

        {!isAccountAll(item.address) && (
          <IconButton
            icon={DotsThree}
            onPress={() => {
              navigation.navigate('EditAccount', { address: item.address, name: item.name });
            }}
          />
        )}
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={accountItemSeparator} />;
  };

  const onCreateAccount = () => {
    setModalVisible(true);
  };

  const renderFooterComponent = () => {
    return (
      <View style={{ paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
        <SubmitButton
          backgroundColor={theme.background2}
          title={i18n.common.addAccount}
          onPress={onCreateAccount}
        />
      </View>
    );
  };

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.settings.account}
      rightIcon={Plus}
      onPressRightIcon={onCreateAccount}>
      <View style={accountsWrapper}>
        <FlatList
          style={{ paddingHorizontal: 16, flex: 1 }}
          keyboardShouldPersistTaps={'handled'}
          data={accounts}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.address}
        />
        {renderFooterComponent()}

        <SelectImportAccountModal
          modalTitle={i18n.common.connectYourAccount}
          modalHeight={308}
          secretTypeList={SECRET_TYPE}
          modalVisible={modalVisible}
          onChangeModalVisible={() => setModalVisible(false)}
        />

        <SelectAccountTypeModal
          modalVisible={selectTypeModalVisible}
          onChangeModalVisible={() => setSelectTypeModalVisible(false)}
          modalHeight={206}
          onSelectSubstrateAccount={onSelectSubstrateAccount}
          onSelectEvmAccount={onSelectEvmAccount}
        />
      </View>
    </SubScreenContainer>
  );
};
