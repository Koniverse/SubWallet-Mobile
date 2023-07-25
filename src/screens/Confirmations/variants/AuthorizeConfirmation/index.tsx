import { KeypairType } from '@polkadot/util-crypto/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountAuthType, AccountJson, AuthorizeRequest } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { PlusCircle, ShieldSlash, XCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { approveAuthRequestV2, cancelAuthRequestV2, rejectAuthRequestV2 } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootStackParamList } from 'routes/index';
import { RootState } from 'stores/index';
import { isNoAccount } from 'utils/account';
import { isAccountAll } from 'utils/accountAll';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';

interface Props {
  request: AuthorizeRequest;
}

async function handleConfirm({ id }: AuthorizeRequest, selectedAccounts: string[]) {
  return await approveAuthRequestV2(
    id,
    selectedAccounts.filter(item => !isAccountAll(item)),
  );
}

async function handleCancel({ id }: AuthorizeRequest) {
  return await cancelAuthRequestV2(id);
}

async function handleBlock({ id }: AuthorizeRequest) {
  return await rejectAuthRequestV2(id);
}

export const filterAuthorizeAccounts = (accounts: AccountJson[], accountAuthType: AccountAuthType) => {
  let rs = [...accounts];

  if (accountAuthType === 'evm') {
    rs = rs.filter(acc => !isAccountAll(acc.address) && acc.type === 'ethereum');
  } else if (accountAuthType === 'substrate') {
    rs = rs.filter(acc => !isAccountAll(acc.address) && acc.type !== 'ethereum');
  } else {
    rs = rs.filter(acc => !isAccountAll(acc.address));
  }

  if (isNoAccount(rs)) {
    return [];
  }

  return rs;
};

const AuthorizeConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const { accountAuthType, allowedAccounts } = request.request;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useSubWalletTheme().swThemes;
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const visibleAccounts = useMemo(
    () => filterAuthorizeAccounts(accounts, accountAuthType || 'both'),
    [accountAuthType, accounts],
  );
  const accountTypeMessage =
    accountAuthType === 'substrate' ? 'Substrate' : accountAuthType === 'evm' ? 'EVM' : 'Substrate & EVM';
  // Selected map with default values is map of all accounts
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  // Create selected map by default
  useEffect(() => {
    setSelectedMap(map => {
      const existedKey = Object.keys(map);

      accounts.forEach(item => {
        if (!existedKey.includes(item.address)) {
          map[item.address] = (allowedAccounts || []).includes(item.address);
        }
      });

      map[ALL_ACCOUNT_KEY] = visibleAccounts.every(item => map[item.address]);

      return { ...map };
    });
  }, [accounts, allowedAccounts, visibleAccounts]);

  // Handle buttons actions
  const onBlock = useCallback(() => {
    setLoading(true);
    handleBlock(request).finally(() => {
      setLoading(false);
    });
  }, [request]);

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(request).finally(() => {
      setLoading(false);
    });
  }, [request]);

  const onConfirm = useCallback(() => {
    setLoading(true);
    const selectedAccounts = Object.keys(selectedMap).filter(key => selectedMap[key]);

    handleConfirm(request, selectedAccounts).finally(() => {
      setLoading(false);
    });
  }, [request, selectedMap]);

  const onAddAccount = useCallback(() => {
    let types: KeypairType[];

    switch (accountAuthType) {
      case 'substrate':
        types = [SUBSTRATE_ACCOUNT_TYPE];
        break;
      case 'evm':
        types = [EVM_ACCOUNT_TYPE];
        break;
      default:
        types = [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE];
    }
    navigation.replace('CreateAccount', { keyTypes: types, isBack: true });
  }, [accountAuthType, navigation]);

  const { onPress: onPressCreateOne } = useUnlockModal(navigation);

  const onAccountSelect = useCallback(
    (address: string) => {
      const isAll = isAccountAll(address);

      return () => {
        const visibleAddresses = visibleAccounts.map(item => item.address);

        setSelectedMap(map => {
          const isChecked = !map[address];
          const newMap = { ...map };

          if (isAll) {
            // Select/deselect all accounts
            visibleAddresses.forEach(key => {
              newMap[key] = isChecked;
            });
            newMap[ALL_ACCOUNT_KEY] = isChecked;
          } else {
            // Select/deselect single account and trigger all account
            newMap[address] = isChecked;
            newMap[ALL_ACCOUNT_KEY] = visibleAddresses.filter(i => !isAccountAll(i)).every(item => newMap[item]);
          }

          return newMap;
        });
      };
    },
    [visibleAccounts],
  );

  return (
    <React.Fragment>
      <ConfirmationContent gap={theme.size}>
        <ConfirmationGeneralInfo request={request} gap={0} />
        {visibleAccounts.length > 0 ? (
          <Text style={styles.text}>{i18n.common.chooseAccount}</Text>
        ) : (
          <>
            <Text style={styles.noAccountTextStyle}>{i18n.common.noAvailableAccount}</Text>
            <Text style={styles.textCenter}>{i18n.common.youDonotHaveAnyAcc(accountTypeMessage || '')}</Text>
          </>
        )}
        <View style={styles.contentContainer}>
          <>
            {visibleAccounts.length > 1 && (
              <AccountItemWithName
                key={ALL_ACCOUNT_KEY}
                isSelected={selectedMap[ALL_ACCOUNT_KEY]}
                address={ALL_ACCOUNT_KEY}
                accountName={i18n.common.allAccounts}
                onPress={onAccountSelect(ALL_ACCOUNT_KEY)}
                avatarSize={24}
                showUnselectIcon={true}
              />
            )}
            {visibleAccounts.map(item => (
              <AccountItemWithName
                key={item.address}
                isSelected={selectedMap[item.address]}
                address={item.address}
                accountName={item.name || ''}
                onPress={onAccountSelect(item.address)}
                avatarSize={24}
                showUnselectIcon={true}
              />
            ))}
          </>
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        {visibleAccounts.length > 0 ? (
          <>
            <Button icon={<Icon phosphorIcon={ShieldSlash} weight="fill" />} type="danger" onPress={onBlock} />
            <Button block={true} type="secondary" onPress={onCancel}>
              {i18n.common.cancel}
            </Button>
            <Button
              block={true}
              onPress={onConfirm}
              disabled={Object.values(selectedMap).every(value => !value)}
              loading={loading}>
              {i18n.common.connect}
            </Button>
          </>
        ) : (
          <>
            <Button
              icon={<Icon phosphorIcon={XCircle} weight="fill" />}
              block={true}
              type="secondary"
              onPress={onCancel}>
              {i18n.common.cancel}
            </Button>
            <Button
              block={true}
              onPress={onPressCreateOne(onAddAccount)}
              icon={<Icon phosphorIcon={PlusCircle} weight="fill" />}>
              Create one
            </Button>
          </>
        )}
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default AuthorizeConfirmation;
