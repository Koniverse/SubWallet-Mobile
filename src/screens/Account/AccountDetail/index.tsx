import { useNavigation } from '@react-navigation/native';
import { Button, Icon } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { SubScreenContainer } from 'components/SubScreenContainer';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CopySimpleIcon, ExportIcon, GitMergeIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { EditAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { editAccount, forgetAccount } from 'messaging/index';
import createStyle from './styles';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { SwTab } from 'components/design-system-ui/tab';
import {
  AccountActions,
  AccountChainType,
  AccountProxy,
  AccountProxyType,
  AccountSignMode,
} from '@subwallet/extension-base/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
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
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { findAccountByAddress } from 'utils/account/account';
import { SubstrateProxyAccountArea } from 'screens/Account/AccountDetail/SubstrateProxyAccountArea';

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
  MANAGE_PROXIES = 'manage-proxies',
  MULTISIG_INFO = 'multisig-info',
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
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const pendingMultisigTxs = useSelector((state: RootState) => state.multisig.pendingMultisigTxs);
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

  // Proxies can only be managed by an account that holds a Substrate address. A legacy
  // Ledger app cannot build the proxy extrinsics, so it is excluded.
  const showManageProxiesTab = useMemo((): boolean => {
    if (!accountProxy.chainTypes.includes(AccountChainType.SUBSTRATE)) {
      return false;
    }

    return accountProxy.accounts[0]?.signMode !== AccountSignMode.LEGACY_LEDGER;
  }, [accountProxy.accounts, accountProxy.chainTypes]);

  const multisigAccount = useMemo(() => {
    if (accountProxy.accountType !== AccountProxyType.MULTISIG) {
      return undefined;
    }

    return accountProxy.accounts.find(account => account.isMultisig);
  }, [accountProxy.accountType, accountProxy.accounts]);

  const signers = multisigAccount?.signers;
  const isMultisig = !!multisigAccount?.isMultisig;

  const showMultisigInfoTab = useMemo((): boolean => {
    if (Array.isArray(signers) && signers.every(item => typeof item === 'string')) {
      return signers.length > 0;
    }

    return false;
  }, [signers]);

  const hasPendingMultisigTx = useMemo(() => {
    if (!multisigAccount) {
      return false;
    }

    return Object.values(pendingMultisigTxs).some(tx => isSameAddress(tx.multisigAddress, multisigAccount.address));
  }, [multisigAccount, pendingMultisigTxs]);

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

  const saveTimeOutRef = useRef<NodeJS.Timeout | null>(null);

  const getDefaultTab = () => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      return AccountDetailTabType.DERIVED_ACCOUNT;
    } else if (requestViewDerivedAccountDetails) {
      return AccountDetailTabType.DERIVATION_INFO;
    } else if (showMultisigInfoTab) {
      return AccountDetailTabType.MULTISIG_INFO;
    } else {
      return AccountDetailTabType.ACCOUNT_ADDRESS;
    }
  };

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

    if (showMultisigInfoTab) {
      result.push({
        label: i18n.multisig.multisigMembers.toUpperCase(),
        value: AccountDetailTabType.MULTISIG_INFO,
        onPress: () => {},
      });
    }

    if (showManageProxiesTab) {
      result.push({
        label: i18n.substrateProxy.manageProxies.toUpperCase(),
        value: AccountDetailTabType.MANAGE_PROXIES,
        onPress: () => {},
      });
    }

    return result;
  }, [showDerivationInfoTab, showDerivedAccounts, showManageProxiesTab, showMultisigInfoTab]);

  const onExportAccount = useCallback(() => {
    navigation.navigate('AccountExport', { address: accountProxy.id });
  }, [accountProxy.id, navigation]);

  const onSave = useCallback(
    (editName: string) => {
      saveTimeOutRef.current && clearTimeout(saveTimeOutRef.current);
      if (editName.trim()) {
        editAccount(accountProxy.id, editName.trim()).catch((e: Error) => {
          onUpdateErrors('accountName')([e.message]);
        });
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
      saveTimeOutRef.current && clearTimeout(saveTimeOutRef.current);
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
    // The proxy tab brings its own Add / Remove footer.
    if (selectedTab === AccountDetailTabType.MANAGE_PROXIES) {
      return null;
    }

    if (isMultisig || ![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountProxy.accountType)) {
      return (
        <Button
          block
          icon={<Icon phosphorIcon={TrashIcon} weight={'fill'} size={'lg'} />}
          style={styles.noPaddingHorizontal}
          onPress={onPressDelete}
          loading={deleting}
          disabled={deleting}
          type={'danger'}>
          {isMultisig ? i18n.multisig.remove : 'Delete account'}
        </Button>
      );
    }

    return (
      <>
        <Button
          icon={<Icon phosphorIcon={TrashIcon} weight={'fill'} size={'lg'} />}
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
              phosphorIcon={GitMergeIcon}
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
              phosphorIcon={ExportIcon}
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
    isMultisig,
    onExportAccount,
    onPressDelete,
    onPressDeriveAccount,
    selectedTab,
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

  const onCopySignerAddress = useCallback(
    (signer: string) => () => {
      Clipboard.setString(signer);
      toast.show(i18n.common.copiedToClipboard, { type: 'success' });
    },
    [toast],
  );

  const renderSignerAddresses = () => {
    if (!Array.isArray(signers)) {
      return null;
    }

    return (
      <ScrollView style={styles.signerList} contentContainerStyle={styles.signerListContent}>
        {signers.map((signer: string) => {
          const accountInWallet = findAccountByAddress(accounts, signer);

          return (
            <AccountItemWithName
              key={signer}
              address={signer}
              accountName={accountInWallet?.name}
              avatarSize={24}
              customStyle={{ container: styles.signerItem }}
              rightItem={
                <Button
                  size={'xs'}
                  type={'ghost'}
                  icon={<Icon phosphorIcon={CopySimpleIcon} size={'sm'} iconColor={theme.colorTextLight4} />}
                  onPress={onCopySignerAddress(signer)}
                />
              }
            />
          );
        })}
      </ScrollView>
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
    } else if (showMultisigInfoTab) {
      setSelectedTab(AccountDetailTabType.MULTISIG_INFO);
    } else {
      setSelectedTab(AccountDetailTabType.ACCOUNT_ADDRESS);
    }
  }, [requestViewDerivedAccountDetails, requestViewDerivedAccounts, showDerivedAccounts, showMultisigInfoTab]);

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.header.accountDetails}
      rightIcon={XIcon}
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
                <AccountChainTypeLogos chainTypes={accountProxy.chainTypes} />
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
          {selectedTab === AccountDetailTabType.MULTISIG_INFO && renderSignerAddresses()}
          {selectedTab === AccountDetailTabType.MANAGE_PROXIES && (
            <SubstrateProxyAccountArea accountProxy={accountProxy} />
          )}
        </View>
        <DeleteModal
          title={isMultisig ? i18n.multisig.removeMultisigAccount : i18n.header.removeThisAcc}
          visible={deleteVisible}
          message={
            isMultisig
              ? hasPendingMultisigTx
                ? i18n.multisig.removeAccountWithPendingTxsWarning
                : i18n.multisig.removeMultisigAccountWarning
              : i18n.removeAccount.removeAccountMessage
          }
          onCancelModal={onCancelDelete}
          onCompleteModal={onCompleteDeleteModal}
          setVisible={setVisible}
        />
        {!!footerNode && (
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
        )}
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
  //   if (!accountProxy) {
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
