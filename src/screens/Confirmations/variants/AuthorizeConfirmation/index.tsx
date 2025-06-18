import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountAuthType, AuthorizeRequest } from '@subwallet/extension-base/background/types';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import {
  ALL_ACCOUNT_AUTH_TYPES,
  DEFAULT_ACCOUNT_TYPES,
  EVM_ACCOUNT_TYPE,
  SUBSTRATE_ACCOUNT_TYPE,
  TON_ACCOUNT_TYPE,
} from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { PlusCircle, ShieldSlash, XCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, Platform, Text, View } from 'react-native';
import { approveAuthRequestV2, cancelAuthRequestV2, rejectAuthRequestV2 } from 'messaging/index';
import { useSelector } from 'react-redux';
import { RootStackParamList } from 'routes/index';
import { RootState } from 'stores/index';
import { isAccountAll } from 'utils/accountAll';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';
import { useHandleInternetConnectionForConfirmation } from 'hooks/useHandleInternetConnectionForConfirmation';
import { AccountChainType } from '@subwallet/extension-base/types';
import { convertAuthorizeTypeToChainTypes, filterAuthorizeAccountProxies } from 'utils/accountProxy';
import { KeypairType } from '@subwallet/keyring/types';
import useSetSelectedMnemonicType from 'hooks/account/useSetSelectedMnemonicType';
import { AccountProxyItem } from 'components/AccountProxy/AccountProxyItem';

interface Props {
  request: AuthorizeRequest;
  navigation: NativeStackNavigationProp<RootStackParamList>;
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

const AuthorizeConfirmation: React.FC<Props> = (props: Props) => {
  const { request, navigation } = props;
  const { accountAuthTypes, allowedAccounts } = request.request;
  const theme = useSubWalletTheme().swThemes;
  const { accountProxies, accounts } = useSelector((state: RootState) => state.accountState);
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const visibleAccountProxies = useMemo(
    () => filterAuthorizeAccountProxies(accountProxies, accountAuthTypes || ALL_ACCOUNT_AUTH_TYPES),
    [accountAuthTypes, accountProxies],
  );
  const setSelectedMnemonicType = useSetSelectedMnemonicType(true);
  const noAvailableTitle: string = useMemo(() => {
    if (accountAuthTypes && accountAuthTypes.length === 1) {
      switch (accountAuthTypes[0]) {
        case 'substrate':
          return 'No available Substrate account';
        case 'evm':
          return 'No available EVM account';
        case 'ton':
          return 'No available TON account';
      }
    }

    return 'No available account';
  }, [accountAuthTypes]);

  const noAvailableDescription: string = useMemo(() => {
    if (accountAuthTypes && accountAuthTypes.length === 1) {
      switch (accountAuthTypes[0]) {
        case 'substrate':
          return "You don't have any Substrate account to connect. Please create one or skip this step by hitting Cancel.";
        case 'evm':
          return "You don't have any EVM account to connect. Please create one or skip this step by hitting Cancel.";
      }
    }

    return "You don't have any account to connect. Please create one or skip this step by hitting Cancel.";
  }, [accountAuthTypes]);
  // Selected map with default values is map of all accounts
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  // Create selected map by default
  useEffect(() => {
    setSelectedMap(map => {
      const existedKey = Object.keys(map);

      accountProxies.forEach(item => {
        if (!existedKey.includes(item.id)) {
          map[item.id] = (allowedAccounts || []).includes(item.id);
        }
      });

      map[ALL_ACCOUNT_KEY] = visibleAccountProxies.every(item => map[item.id]);

      return { ...map };
    });
  }, [accountProxies, allowedAccounts, visibleAccountProxies]);

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
    const selectedAccountProxyIds = Object.keys(selectedMap).filter(key => selectedMap[key]);
    const selectedAccounts = accounts
      .filter(({ chainType, proxyId }) => {
        if (selectedAccountProxyIds.includes(proxyId || '')) {
          switch (chainType) {
            case AccountChainType.SUBSTRATE:
              return accountAuthTypes?.includes('substrate');
            case AccountChainType.ETHEREUM:
              return accountAuthTypes?.includes('evm');
            case AccountChainType.TON:
              return accountAuthTypes?.includes('ton');
          }
        }

        return false;
      })
      .map(({ address }) => address);

    handleConfirm(request, selectedAccounts).finally(() => {
      setLoading(false);
    });
  }, [accountAuthTypes, accounts, request, selectedMap]);

  const onAddAccount = useCallback(() => {
    let types: KeypairType[];

    const addAccountType: Record<AccountAuthType, KeypairType> = {
      evm: EVM_ACCOUNT_TYPE,
      substrate: SUBSTRATE_ACCOUNT_TYPE,
      ton: TON_ACCOUNT_TYPE,
    };

    if (accountAuthTypes) {
      types = accountAuthTypes.map(type => addAccountType[type]);
    } else {
      types = DEFAULT_ACCOUNT_TYPES;
    }
    console.log('types', types);

    setSelectedMnemonicType('general');
    navigation.replace('CreateAccount', { isBack: true });
  }, [accountAuthTypes, navigation, setSelectedMnemonicType]);

  const { onPress: onPressCreateOne } = useUnlockModal(navigation);

  const onAccountSelect = useCallback(
    (address: string) => {
      const isAll = isAccountAll(address);

      return () => {
        const visibleAddresses = visibleAccountProxies.map(item => item.id);

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
    [visibleAccountProxies],
  );

  const isDisableConnect = useMemo(() => {
    return !visibleAccountProxies.filter(({ id }) => !!selectedMap[id]).length;
  }, [selectedMap, visibleAccountProxies]);

  useHandleInternetConnectionForConfirmation(onCancel);

  return (
    <React.Fragment>
      <ConfirmationContent gap={theme.size}>
        <ConfirmationGeneralInfo request={request} gap={0} />
        {visibleAccountProxies.length > 0 ? (
          <Text style={styles.text}>{i18n.common.chooseAccount}</Text>
        ) : (
          <>
            <Text style={styles.noAccountTextStyle}>{noAvailableTitle}</Text>
            <Text style={styles.textCenter}>{noAvailableDescription}</Text>
          </>
        )}
        <View style={styles.contentContainer}>
          <>
            {visibleAccountProxies.length > 1 && (
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
            {visibleAccountProxies.map(item => (
              <AccountProxyItem
                accountProxy={item}
                chainTypes={convertAuthorizeTypeToChainTypes(accountAuthTypes, item.chainTypes)}
                isSelected={selectedMap[item.id]}
                key={item.id}
                onPress={onAccountSelect(item.id)}
                showUnselectIcon
              />
            ))}
          </>
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        {visibleAccountProxies.length > 0 ? (
          <>
            <Button icon={<Icon phosphorIcon={ShieldSlash} weight="fill" />} type="danger" onPress={onBlock} />
            <Button block={true} type="secondary" onPress={onCancel}>
              {i18n.common.cancel}
            </Button>
            <Button block={true} onPress={onConfirm} disabled={isDisableConnect} loading={loading}>
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
              onPress={() => {
                Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
                onPressCreateOne(onAddAccount)();
              }}
              icon={<Icon phosphorIcon={PlusCircle} weight="fill" />}>
              {i18n.buttonTitles.createOne}
            </Button>
          </>
        )}
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default AuthorizeConfirmation;
