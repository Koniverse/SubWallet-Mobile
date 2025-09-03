import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import {
  DotsThree,
  Plugs,
  PlugsConnected,
  Shield,
  ShieldSlash,
  Users,
  X,
  Plug,
  ArrowsLeftRight,
} from 'phosphor-react-native';
import { MoreOptionItemType, MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppAccessDetailProps, RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { changeAuthorization, changeAuthorizationPerSite, forgetSite, toggleAuthorization } from 'messaging/index';
import { updateAuthUrls } from 'stores/updater';
import { useNavigation } from '@react-navigation/native';
import i18n from 'utils/i18n/i18n';
import { EmptyList } from 'components/EmptyList';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { BackgroundIcon, Typography } from 'components/design-system-ui';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import DappAccessItem, { getSiteTitle } from 'components/design-system-ui/web3-block/DappAccessItem';
import { getHostName } from 'utils/browser';
import { ThemeTypes } from 'styles/themes';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { AccountAuthType } from '@subwallet/extension-base/background/types';
import { getAccountCount } from 'screens/Settings/Security/DAppAccess/index';
import { AccountProxyItem } from 'components/AccountProxy/AccountProxyItem';
import { convertAuthorizeTypeToChainTypes } from 'utils/accountProxy';

type Props = {
  origin: string;
  accountAuthTypes: AccountAuthType[];
  authInfo: AuthUrlInfo;
};

enum ConnectionStatement {
  NOT_CONNECTED = 'not-connected',
  CONNECTED = 'connected',
  PARTIAL_CONNECTED = 'partial-connected',
  DISCONNECTED = 'disconnected',
  BLOCKED = 'blocked',
}

const iconMap = {
  [ConnectionStatement.NOT_CONNECTED]: Plug,
  [ConnectionStatement.CONNECTED]: PlugsConnected,
  [ConnectionStatement.PARTIAL_CONNECTED]: PlugsConnected,
  [ConnectionStatement.DISCONNECTED]: Plugs,
  [ConnectionStatement.BLOCKED]: Plugs,
};

const searchFunction = (items: AccountProxy[], searchString: string) => {
  return items.filter(
    item =>
      item.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.id.toLowerCase().includes(searchString.toLowerCase()),
  );
};

const checkAccountAddressValid = (chainType: AccountChainType, accountAuthTypes?: AccountAuthType[]): boolean => {
  if (!accountAuthTypes) {
    return false;
  }

  switch (chainType) {
    case AccountChainType.SUBSTRATE:
      return accountAuthTypes.includes('substrate');
    case AccountChainType.ETHEREUM:
      return accountAuthTypes.includes('evm');
    case AccountChainType.TON:
      return accountAuthTypes.includes('ton');
  }

  return false;
};

const Content = ({ origin, accountAuthTypes, authInfo }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const theme = useSubWalletTheme().swThemes;
  const hostName = getHostName(authInfo.url);
  const accountProxyItems = useMemo(() => {
    return accountProxies.filter(
      ap => ap.id !== 'ALL' && ap.chainTypes.some(chainType => checkAccountAddressValid(chainType, accountAuthTypes)),
    );
  }, [accountAuthTypes, accountProxies]);
  const styles = createStyle(theme);
  const accountConnectedItemLength = useMemo(
    () => getAccountCount(authInfo, accountProxies),
    [accountProxies, authInfo],
  );

  const dAppStatus = useMemo(() => {
    if (authInfo) {
      if (!authInfo.isAllowed) {
        return ConnectionStatement.BLOCKED;
      } else {
        if (accountConnectedItemLength === 0) {
          return ConnectionStatement.DISCONNECTED;
        } else {
          if (accountConnectedItemLength > 0 && accountConnectedItemLength < accountProxyItems.length) {
            return ConnectionStatement.PARTIAL_CONNECTED;
          } else {
            return ConnectionStatement.CONNECTED;
          }
        }
      }
    } else {
      return ConnectionStatement.NOT_CONNECTED;
    }
  }, [accountConnectedItemLength, accountProxyItems.length, authInfo]);

  const iconBackgroundColorMap = useMemo(
    () => ({
      [ConnectionStatement.DISCONNECTED]: theme['gray-3'],
      [ConnectionStatement.BLOCKED]: theme.colorError,
      [ConnectionStatement.NOT_CONNECTED]: theme['gray-3'],
      [ConnectionStatement.PARTIAL_CONNECTED]: theme.colorWarning,
      [ConnectionStatement.CONNECTED]: theme['green-6'],
    }),
    [theme],
  );

  const renderBeforeListItem = () => (
    <>
      <DappAccessItem
        containerStyle={{ marginVertical: 16 }}
        item={authInfo}
        accountCount={accountConnectedItemLength}
        middleItem={
          <View style={{ flexDirection: 'row', alignItems: 'stretch', flex: 1, justifyContent: 'space-between' }}>
            <Typography.Text ellipsis style={styles.dAppAccessDetailName}>
              {getSiteTitle(hostName, authInfo.origin)}
            </Typography.Text>
            <Typography.Text ellipsis style={styles.dAppAccessDetailHostName}>
              {hostName}
            </Typography.Text>
          </View>
        }
        rightItem={
          <BackgroundIcon
            shape={'circle'}
            backgroundColor={iconBackgroundColorMap[dAppStatus]}
            phosphorIcon={iconMap[dAppStatus]}
            weight={'fill'}
          />
        }
      />
      <Typography.Text style={{ paddingLeft: theme.padding, paddingBottom: 4 }}>
        <Typography.Text style={styles.dAppAccessDetailConnectedAcc}>
          {`${('0' + accountConnectedItemLength).slice(-2)}`}
        </Typography.Text>
        <Typography.Text style={styles.dAppAccessDetailAllAcc}>
          {`/${('0' + accountProxyItems.length).slice(-2)} ${i18n.common.accountConnected}`}
        </Typography.Text>
      </Typography.Text>
    </>
  );

  const dAppAccessDetailMoreOptions: MoreOptionItemType[] = useMemo(() => {
    const isAllowed = authInfo.isAllowed;
    const isEvmAuthorize = authInfo.accountAuthTypes.includes('evm');

    const options = [
      {
        key: 'forgetSite',
        icon: X,
        backgroundColor: theme['yellow-6'],
        name: i18n.common.forgetSite,
        onPress: () => {
          forgetSite(origin, updateAuthUrls).catch(console.error);
          navigation.canGoBack() && navigation.goBack();
        },
      },
    ];

    if (isAllowed) {
      options.push(
        {
          key: 'disconnectAll',
          icon: Plugs,
          name: i18n.common.disconnectAll,
          // @ts-ignore
          backgroundColor: theme['gray-3'],
          onPress: () => {
            changeAuthorization(false, origin, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
        {
          key: 'connectAll',
          icon: PlugsConnected,
          name: i18n.common.connectAll,
          backgroundColor: theme['green-6'],
          onPress: () => {
            changeAuthorization(true, origin, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
      );
    }

    if (isEvmAuthorize) {
      options.push({
        key: 'switchNetwork',
        icon: ArrowsLeftRight,
        backgroundColor: theme['geekblue-6'],
        name: 'Switch network',
        onPress: () => {
          switchNetworkAuthorizeModal.open({
            authUrlInfo: authInfo,
            onComplete: list => {
              updateAuthUrls(list);
            },
          });
        },
      });
    }

    options.push({
      key: 'blockOrUnblock',
      name: isAllowed ? i18n.common.block : i18n.common.unblock,
      icon: isAllowed ? ShieldSlash : Shield,
      // @ts-ignore
      backgroundColor: isAllowed ? theme['red-6'] : theme['green-6'],
      onPress: () => {
        toggleAuthorization(origin)
          .then(({ list }) => {
            updateAuthUrls(list);
          })
          .catch(console.error);
        setModalVisible(false);
      },
    });

    return options;
  }, [authInfo.isAllowed, theme, origin, navigation]);

  useEffect(() => {
    setPendingMap(prevMap => {
      if (!Object.keys(prevMap).length) {
        return prevMap;
      }

      return {};
    });
  }, [authInfo]);

  const rightIconOption = useMemo(() => {
    return {
      icon: DotsThree,
      onPress: () => setModalVisible(true),
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountProxy>) => {
      const isEnabled: boolean = item.accounts.some(account => authInfo.isAllowedMap[account.address]);

      const onChangeToggle = () => {
        setPendingMap(prevMap => {
          return {
            ...prevMap,
            [item.id]: !isEnabled,
          };
        });
        const newAllowedMap = { ...authInfo.isAllowedMap };

        item.accounts.forEach(account => {
          if (checkAccountAddressValid(account.chainType, authInfo.accountAuthTypes)) {
            newAllowedMap[account.address] = !isEnabled;
          }
        });
        changeAuthorizationPerSite({ values: newAllowedMap, id: authInfo.id })
          .catch(console.log)
          .finally(() => {
            setPendingMap(prevMap => {
              const newMap = { ...prevMap };

              delete newMap[item.id];

              return newMap;
            });
          });
      };

      return (
        <View style={{ marginBottom: theme.marginXS, marginHorizontal: theme.margin }}>
          <AccountProxyItem
            accountProxy={item}
            chainTypes={convertAuthorizeTypeToChainTypes(authInfo.accountAuthTypes, item.chainTypes)}
            key={item.id}
            disabled={!authInfo.isAllowed}
            rightPartNode={
              <Switch
                disabled={pendingMap[item.id] !== undefined || !authInfo.isAllowed}
                ios_backgroundColor={ColorMap.switchInactiveButtonColor}
                value={pendingMap[item.id] === undefined ? isEnabled : pendingMap[item.id]}
                onValueChange={onChangeToggle}
              />
            }
          />
        </View>
      );
    },
    [
      theme.marginXS,
      theme.margin,
      authInfo.accountAuthTypes,
      authInfo.isAllowed,
      authInfo.isAllowedMap,
      authInfo.id,
      pendingMap,
    ],
  );

  return (
    <FlatListScreen
      title={origin}
      autoFocus={false}
      onPressBack={() => navigation.goBack()}
      beforeListItem={renderBeforeListItem()}
      items={accountProxyItems}
      searchFunction={searchFunction}
      placeholder={i18n.placeholder.accountName}
      renderListEmptyComponent={() => (
        <EmptyList
          icon={Users}
          title={i18n.emptyScreen.manageDAppDetailEmptyTitle}
          message={i18n.emptyScreen.manageDAppDetailEmptyMessage}
        />
      )}
      estimatedItemSize={60}
      rightIconOption={rightIconOption}
      renderItem={renderItem}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dAppAccessDetailMoreOptions}
          setModalVisible={setModalVisible}
        />
      }
      extraData={JSON.stringify(authInfo).concat(JSON.stringify(pendingMap))}
      keyExtractor={item => item.id}
    />
  );
};

export const DAppAccessDetailScreen = ({
  route: {
    params: { origin, accountAuthTypes },
  },
}: DAppAccessDetailProps) => {
  const authInfo: undefined | AuthUrlInfo = useSelector((state: RootState) => state.settings.authUrls[origin]);
  const [_authInfo, setAuthInfo] = useState<undefined | AuthUrlInfo>(undefined);

  useEffect(() => {
    setAuthInfo(authInfo);
  }, [authInfo]);

  return <>{!!_authInfo && <Content accountAuthTypes={accountAuthTypes} origin={origin} authInfo={_authInfo} />}</>;
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    dAppAccessDetailName: {
      flex: 1,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorWhite,
      paddingRight: 30,
    },
    dAppAccessDetailHostName: {
      flex: 1,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextTertiary,
      textAlign: 'right',
      paddingLeft: 30,
      paddingRight: 8,
    },
    dAppAccessDetailConnectedAcc: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
      color: theme.colorWhite,
    },
    dAppAccessDetailAllAcc: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
      color: theme.colorTextTertiary,
    },
  });
}
