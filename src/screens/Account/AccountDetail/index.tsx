import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { SubScreenContainer } from 'components/SubScreenContainer';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Export, FloppyDiskBack, GitMerge, Trash, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { EditAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { editAccount } from 'messaging/index';
import createStyle from './styles';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { SwTab } from 'components/design-system-ui/tab';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontSemiBold } from 'styles/sharedStyles';
import { AccountAddressList } from './AccountAddressList';
import { DerivedAccountList } from 'screens/Account/AccountDetail/DerivedAccountList';

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
}

const Component = ({ accountProxy }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const theme = useSubWalletTheme().swThemes;
  const showDerivedAccounts = !!accountProxy?.children?.length;
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);

  const styles = useMemo(() => createStyle(theme), [theme]);

  const showDerivationInfoTab = useMemo((): boolean => {
    if (accountProxy.parentId) {
      return !!accountProxies.find(acc => acc.id === accountProxy.parentId);
    } else {
      return false;
    }
  }, [accountProxies, accountProxy.parentId]);

  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: accountProxy.name,
      },
    }),
    [accountProxy.name],
  );

  const saveTimeOutRef = useRef<NodeJS.Timeout>();

  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(AccountDetailTabType.ACCOUNT_ADDRESS);
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
        label: 'Derived account',
        value: AccountDetailTabType.DERIVED_ACCOUNT,
        onPress: () => {},
      });
    }

    if (showDerivationInfoTab) {
      result.push({
        label: 'Derivation info',
        value: AccountDetailTabType.DERIVATION_INFO,
        onPress: () => {},
      });
    }

    return result;
  }, [showDerivationInfoTab, showDerivedAccounts]);

  const onSave = useCallback(
    (editName: string) => {
      clearTimeout(saveTimeOutRef.current);
      editAccount(accountProxy.id, editName)
        .catch(e => console.log(e))
        .finally(() => setSaving(false));
    },
    [accountProxy.id],
  );

  const _saveChange = useCallback(
    (formState: FormState) => {
      const editName = formState.data.accountName;
      onSave(editName);
    },
    [onSave],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
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

  const footerNode = useMemo(() => {
    if (![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountProxy.accountType)) {
      return (
        <Button
          block
          icon={<Icon phosphorIcon={Trash} weight={'fill'} size={'lg'} />}
          style={styles.noPaddingHorizontal}
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
        />
        <Button
          block
          style={styles.noPaddingHorizontal}
          icon={<Icon phosphorIcon={GitMerge} weight={'fill'} size={'lg'} />}
          type={'secondary'}>
          {'Derive'}
        </Button>
        <Button
          block
          style={styles.noPaddingHorizontal}
          icon={<Icon phosphorIcon={Export} weight={'fill'} size={'lg'} />}
          type={'secondary'}>
          {'Export'}
        </Button>
      </>
    );
  }, [accountProxy.accountType, styles.noPaddingHorizontal]);

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
            itemStyle={{ backgroundColor: 'transparent', flex: undefined, height: 20 }}
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
          {/*{selectedTab === AccountDetailTabType.DERIVATION_INFO && renderDetailDerivedAccount()}*/}
        </View>
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
    params: { address: accountProxyId },
  },
}: EditAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const accountProxy = useGetAccountProxyById(accountProxyId);

  useEffect(() => {
    if (!accountProxy) {
      navigation.goBack();
    }
  }, [accountProxy, navigation]);

  if (!accountProxy) {
    return <></>;
  }

  return <Component accountProxy={accountProxy} />;
};
