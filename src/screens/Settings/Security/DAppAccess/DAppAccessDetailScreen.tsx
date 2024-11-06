import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { DotsThree, Plugs, PlugsConnected, Shield, ShieldSlash, Users, X } from 'phosphor-react-native';
import { MoreOptionItemType, MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppAccessDetailProps, RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { changeAuthorization, changeAuthorizationPerAccount, forgetSite, toggleAuthorization } from 'messaging/index';
import { updateAuthUrls } from 'stores/updater';
import { useNavigation } from '@react-navigation/native';
import i18n from 'utils/i18n/i18n';
import { EmptyList } from 'components/EmptyList';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { BackgroundIcon, Typography } from 'components/design-system-ui';
import { DisabledStyle, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import DappAccessItem, { getSiteTitle } from 'components/design-system-ui/web3-block/DappAccessItem';
import { getHostName } from 'utils/browser';
import { ThemeTypes } from 'styles/themes';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { AccountChainType, AccountProxy } from '@subwallet/extension-base/types';
import { AccountAuthType } from '@subwallet/extension-base/background/types';

type Props = {
  origin: string;
  accountAuthTypes: AccountAuthType[];
  authInfo: AuthUrlInfo;
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
  const accountConnectedItems = useMemo(() => {
    return accountProxyItems.filter(acc => authInfo.isAllowedMap[acc.id]);
  }, [accountProxyItems, authInfo.isAllowedMap]);

  const renderBeforeListItem = () => (
    <>
      <DappAccessItem
        containerStyle={{ marginVertical: 16 }}
        item={authInfo}
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
            backgroundColor={authInfo.isAllowed ? theme['green-6'] : theme.colorError}
            phosphorIcon={authInfo.isAllowed ? PlugsConnected : ShieldSlash}
            weight={'fill'}
          />
        }
      />
      <Typography.Text style={{ paddingLeft: theme.padding, paddingBottom: 4 }}>
        <Typography.Text style={styles.dAppAccessDetailConnectedAcc}>
          {`${('0' + accountConnectedItems.length).slice(-2)}`}
        </Typography.Text>
        <Typography.Text style={styles.dAppAccessDetailAllAcc}>
          {`/${('0' + accountProxyItems.length).slice(-2)} ${i18n.common.accountConnected}`}
        </Typography.Text>
      </Typography.Text>
    </>
  );

  const dAppAccessDetailMoreOptions: MoreOptionItemType[] = useMemo(() => {
    const isAllowed = authInfo.isAllowed;

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
      const isEnabled: boolean = authInfo.isAllowedMap[item.id];

      const onChangeToggle = () => {
        setPendingMap(prevMap => {
          return {
            ...prevMap,
            [item.id]: !isEnabled,
          };
        });
        changeAuthorizationPerAccount(item.id, !isEnabled, origin, updateAuthUrls).catch(() => {
          setPendingMap(prevMap => {
            const newMap = { ...prevMap };

            delete newMap[item.id];

            return newMap;
          });
        });
      };

      return (
        <View style={{ marginBottom: theme.marginXS }}>
          <AccountItemWithName
            customStyle={{ container: [{ marginHorizontal: theme.margin }, !authInfo.isAllowed && DisabledStyle] }}
            address={item.id}
            accountName={item.name}
            renderRightItem={() => (
              <Switch
                disabled={pendingMap[item.id] !== undefined || !authInfo.isAllowed}
                ios_backgroundColor={ColorMap.switchInactiveButtonColor}
                value={pendingMap[item.id] === undefined ? isEnabled : pendingMap[item.id]}
                onValueChange={onChangeToggle}
              />
            )}
          />
        </View>
      );
    },
    [authInfo.isAllowedMap, authInfo.isAllowed, theme.marginXS, theme.margin, origin, pendingMap],
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

  return <>{!!authInfo && <Content accountAuthTypes={accountAuthTypes} origin={origin} authInfo={authInfo} />}</>;
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
