import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { SubScreenContainer } from 'components/SubScreenContainer';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Export, FloppyDiskBack, GitMerge, Trash, X } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { EditAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { editAccount, forgetAccount } from 'messaging/index';
import createStyle from './styles';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { SwTab } from 'components/design-system-ui/tab';
import { AccountActions, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontSemiBold } from 'styles/sharedStyles';
import { AccountAddressList } from './AccountAddressList';
import { DerivedAccountList } from 'screens/Account/AccountDetail/DerivedAccountList';
import { TextField } from 'components/Field/Text';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import { useToast } from 'react-native-toast-notifications';
import DeleteModal from 'components/common/Modal/DeleteModal';
import { AppModalContext } from 'providers/AppModalContext';

export type AccountDetailTab = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  value: string;
};

enum AccountDetailTabType {
  ACCOUNT_ADDRESS = 'account-address',
  DERIVED_ACCOUNT = 'derived-account',
  DERIVATION_INFO = 'derivation-info',
}

interface Props {
  accountProxy: AccountProxy;
  requestViewDerivedAccountDetails?: boolean;
  requestViewDerivedAccounts?: boolean;
}

const Component = ({ accountProxy, requestViewDerivedAccounts, requestViewDerivedAccountDetails }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const theme = useSubWalletTheme().swThemes;
  const showDerivedAccounts = !!accountProxy?.children?.length;
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const [deleting, setDeleting] = useState(false);
  const styles = useMemo(() => createStyle(theme), [theme]);
  const toast = useToast();
  const { deriveModal } = useContext(AppModalContext);

  const showDerivationInfoTab = useMemo((): boolean => {
    if (accountProxy.parentId) {
      return !!accountProxies.find(acc => acc.id === accountProxy.parentId);
    } else {
      return false;
    }
  }, [accountProxies, accountProxy.parentId]);

  const parentDerivedAccountProxy = useMemo(() => {
    if (showDerivationInfoTab) {
      return accountProxies.find(acc => acc.id === accountProxy.parentId);
    }

    return null;
  }, [accountProxies, accountProxy.parentId, showDerivationInfoTab]);

  const onDelete = useCallback(() => {
    if (accountProxy?.id) {
      setDeleting(true);
      forgetAccount(accountProxy.id)
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
  }, [accountProxy?.id, goHome, toast]);

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
    setVisible,
  } = useConfirmModal(onDelete);

  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: accountProxy.name,
        require: true,
      },
    }),
    [accountProxy.name],
  );

  const saveTimeOutRef = useRef<NodeJS.Timeout>();

  const getDefaultTab = () => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      return AccountDetailTabType.DERIVED_ACCOUNT;
    } else if (requestViewDerivedAccountDetails) {
      return AccountDetailTabType.DERIVATION_INFO;
    } else {
      return AccountDetailTabType.ACCOUNT_ADDRESS;
    }
  };

  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(getDefaultTab());
  const _onSelectType = (value: string) => {
    setSelectedTab(value);
  };

  const accountDetailTabs: AccountDetailTab[] = useMemo(() => {
    const result = [
      {
        label: 'ACCOUNT ADDRESS',
        value: AccountDetailTabType.ACCOUNT_ADDRESS,
        onPress: () => {},
      },
    ];

    if (showDerivedAccounts) {
      result.push({
        label: 'DERIVED ACCOUNT',
        value: AccountDetailTabType.DERIVED_ACCOUNT,
        onPress: () => {},
      });
    }

    if (showDerivationInfoTab) {
      result.push({
        label: 'DERIVATION INFO',
        value: AccountDetailTabType.DERIVATION_INFO,
        onPress: () => {},
      });
    }

    return result;
  }, [showDerivationInfoTab, showDerivedAccounts]);

  const onExportAccount = useCallback(() => {
    navigation.navigate('AccountExport', { address: accountProxy.id });
  }, [accountProxy.id, navigation]);

  const onSave = useCallback(
    (editName: string) => {
      clearTimeout(saveTimeOutRef.current);
      if (editName.trim()) {
        editAccount(accountProxy.id, editName.trim())
          .catch((e: Error) => {
            onUpdateErrors('accountName')([e.message]);
          })
          .finally(() => setSaving(false));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountProxy.id],
  );

  const _saveChange = useCallback(
    (formState: FormState) => {
      const editName = formState.data.accountName.trim();
      onSave(editName);
    },
    [onSave],
  );

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: _saveChange,
  });

  const onChangeName = useCallback(
    (value: string) => {
      onChangeValue('accountName')(value);
      setSaving(true);
      clearTimeout(saveTimeOutRef.current);
      saveTimeOutRef.current = setTimeout(() => {
        onSave(value);
      }, 300);
    },
    [onChangeValue, onSave],
  );

  const onPressDeriveAccount = useCallback(() => {
    deriveModal.setDeriveModalState({
      visible: true,
      navigation,
      proxyId: accountProxy.id,
      onCompleteCb: () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      },
    });
  }, [accountProxy.id, deriveModal, navigation]);

  const footerNode = useMemo(() => {
    if (![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountProxy.accountType)) {
      return (
        <Button
          block
          icon={<Icon phosphorIcon={Trash} weight={'fill'} size={'lg'} />}
          style={styles.noPaddingHorizontal}
          onPress={onPressDelete}
          loading={deleting}
          disabled={deleting}
          type={'danger'}>
          {'Delete account'}
        </Button>
      );
    }

    return (
      <>
        <Button
          icon={<Icon phosphorIcon={Trash} weight={'fill'} size={'lg'} />}
          style={styles.noPaddingHorizontal}
          type={'danger'}
          loading={deleting}
          onPress={onPressDelete}
          disabled={deleting}
        />
        <Button
          block
          style={styles.noPaddingHorizontal}
          disabled={!accountProxy.accountActions.includes(AccountActions.DERIVE) || deleting}
          icon={
            <Icon
              phosphorIcon={GitMerge}
              weight={'fill'}
              size={'lg'}
              iconColor={
                !accountProxy.accountActions.includes(AccountActions.DERIVE) || deleting
                  ? theme.colorTextLight5
                  : theme.colorWhite
              }
            />
          }
          onPress={onPressDeriveAccount}
          type={'secondary'}>
          {'Derive'}
        </Button>
        <Button
          block
          style={styles.noPaddingHorizontal}
          onPress={onExportAccount}
          disabled={deleting}
          icon={
            <Icon
              phosphorIcon={Export}
              weight={'fill'}
              size={'lg'}
              iconColor={deleting ? theme.colorTextLight5 : theme.colorWhite}
            />
          }
          type={'secondary'}>
          {'Export'}
        </Button>
      </>
    );
  }, [
    accountProxy.accountActions,
    accountProxy.accountType,
    deleting,
    onExportAccount,
    onPressDelete,
    onPressDeriveAccount,
    styles.noPaddingHorizontal,
    theme.colorTextLight5,
    theme.colorWhite,
  ]);

  const renderDetailDerivedAccount = () => {
    return (
      <View style={{ width: '100%' }}>
        <TextField text={accountProxy.suri || ''} label={'Derivation path'} placeholder={'Derivation path'} />

        {!!parentDerivedAccountProxy && (
          <TextField
            text={parentDerivedAccountProxy?.name || ''}
            label={'Parent account'}
            placeholder={'Parent account'}
          />
        )}
      </View>
    );
  };

  useEffect(() => {
    if (accountProxy) {
      onChangeValue('accountName')(accountProxy.name);
    }
  }, [accountProxy, onChangeValue]);

  useEffect(() => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      setSelectedTab(AccountDetailTabType.DERIVED_ACCOUNT);
    } else if (requestViewDerivedAccountDetails) {
      setSelectedTab(AccountDetailTabType.DERIVATION_INFO);
    } else {
      setSelectedTab(AccountDetailTabType.ACCOUNT_ADDRESS);
    }
  }, [requestViewDerivedAccountDetails, requestViewDerivedAccounts, showDerivedAccounts]);

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.header.accountDetails}
      rightIcon={X}
      onPressRightIcon={goHome}>
      <>
        <View style={{ flex: 1, paddingHorizontal: 16, alignItems: 'center' }}>
          <EditAccountInputText
            ref={formState.refs.accountName}
            label={formState.labels.accountName}
            value={formState.data.accountName}
            errorMessages={formState.errors.accountName}
            editAccountInputStyle={[styles.inputContainer, styles.nameContainer]}
            onChangeText={onChangeName}
            onSubmitField={onSubmitField('accountName')}
            returnKeyType={'go'}
            accountType={accountProxy?.accountType}
            suffix={
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                {saving ? (
                  <ActivityIndicator size={20} indicatorColor={theme['gray-5']} />
                ) : (
                  <Icon phosphorIcon={FloppyDiskBack} size="sm" iconColor={theme['gray-3']} />
                )}
              </View>
            }
          />

          <SwTab
            tabs={accountDetailTabs}
            onSelectType={_onSelectType}
            selectedValue={selectedTab}
            containerStyle={{ backgroundColor: 'transparent', width: '100%', marginBottom: theme.marginSM }}
            itemStyle={{
              backgroundColor: 'transparent',
              flex: undefined,
              height: 20,
              paddingHorizontal: theme.paddingXS,
            }}
            selectedStyle={{ backgroundColor: 'transparent' }}
            textStyle={{
              fontSize: theme.fontSizeSM,
              lineHeight: theme.fontSizeSM * theme.lineHeightSM,
              color: theme.colorTextTertiary,
              ...FontSemiBold,
            }}
            selectedTextStyle={{ color: theme.colorWhite }}
          />

          {selectedTab === AccountDetailTabType.ACCOUNT_ADDRESS && <AccountAddressList accountProxy={accountProxy} />}
          {selectedTab === AccountDetailTabType.DERIVED_ACCOUNT && <DerivedAccountList accountProxy={accountProxy} />}
          {selectedTab === AccountDetailTabType.DERIVATION_INFO && renderDetailDerivedAccount()}
        </View>
        <DeleteModal
          title={i18n.header.removeThisAcc}
          visible={deleteVisible}
          message={i18n.removeAccount.removeAccountMessage}
          onCancelModal={onCancelDelete}
          onCompleteModal={onCompleteDeleteModal}
          setVisible={setVisible}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: theme.sizeXS,
            padding: theme.padding,
          }}>
          {footerNode}
        </View>
      </>
    </SubScreenContainer>
  );
};

export const AccountDetail = ({
  route: {
    params: { address: accountProxyId, requestViewDerivedAccounts, requestViewDerivedAccountDetails },
  },
}: EditAccountProps) => {
  // const navigation = useNavigation<RootNavigationProps>();
  const accountProxy = useGetAccountProxyById(accountProxyId);

  // useEffect(() => {
  //   console.log('accountProxy', accountProxy);
  //   if (!accountProxy) {
  //     console.log('run to this');
  //     navigation.goBack();
  //   }
  // }, [accountProxy, navigation]);

  if (!accountProxy) {
    return <></>;
  }

  return (
    <Component
      accountProxy={accountProxy}
      requestViewDerivedAccounts={requestViewDerivedAccounts}
      requestViewDerivedAccountDetails={requestViewDerivedAccountDetails}
    />
  );
};
