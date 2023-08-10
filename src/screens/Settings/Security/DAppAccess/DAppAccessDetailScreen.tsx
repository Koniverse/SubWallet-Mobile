import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, StyleSheet, Switch, View } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { DotsThree, Plugs, PlugsConnected, Shield, ShieldSlash, Users, X } from 'phosphor-react-native';
import { MoreOptionItemType, MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppAccessDetailProps, RootNavigationProps } from 'routes/index';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ColorMap } from 'styles/color';
import { changeAuthorization, changeAuthorizationPerAccount, forgetSite, toggleAuthorization } from 'messaging/index';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
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

type Props = {
  origin: string;
  accountAuthType: string;
  authInfo: AuthUrlInfo;
};

const searchFunction = (items: AccountJson[], searchString: string) => {
  return items.filter(
    item =>
      item.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.address.toLowerCase().includes(searchString.toLowerCase()),
  );
};

const Content = ({ origin, accountAuthType, authInfo }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const theme = useSubWalletTheme().swThemes;
  const hostName = getHostName(authInfo.url);
  const accountItems = useMemo(() => {
    const accountListWithoutAll = accounts.filter(opt => opt.address !== 'ALL');

    if (accountAuthType === 'substrate') {
      return accountListWithoutAll.filter(acc => !isEthereumAddress(acc.address));
    } else if (accountAuthType === 'evm') {
      return accountListWithoutAll.filter(acc => isEthereumAddress(acc.address));
    } else {
      return accountListWithoutAll;
    }
  }, [accountAuthType, accounts]);
  const styles = createStyle(theme);
  const accountConnectedItems = useMemo(() => {
    return accountItems.filter(acc => authInfo.isAllowedMap[acc.address]);
  }, [accountItems, authInfo.isAllowedMap]);

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
          {`/${('0' + accountItems.length).slice(-2)} ${i18n.common.accountConnected}`}
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
    ({ item }: ListRenderItemInfo<AccountJson>) => {
      const isEnabled: boolean = authInfo.isAllowedMap[item.address];

      const onChangeToggle = () => {
        setPendingMap(prevMap => {
          return {
            ...prevMap,
            [item.address]: !isEnabled,
          };
        });
        changeAuthorizationPerAccount(item.address, !isEnabled, origin, updateAuthUrls).catch(() => {
          setPendingMap(prevMap => {
            const newMap = { ...prevMap };

            delete newMap[item.address];

            return newMap;
          });
        });
      };

      return (
        <>
          <AccountItemWithName
            customStyle={{ container: [{ marginHorizontal: theme.margin }, !authInfo.isAllowed && DisabledStyle] }}
            address={item.address}
            accountName={item.name}
            renderRightItem={() => (
              <Switch
                disabled={pendingMap[item.address] !== undefined || !authInfo.isAllowed}
                ios_backgroundColor={ColorMap.switchInactiveButtonColor}
                value={pendingMap[item.address] === undefined ? isEnabled : pendingMap[item.address]}
                onValueChange={onChangeToggle}
              />
            )}
          />
        </>
      );
    },
    [authInfo.isAllowedMap, authInfo.isAllowed, theme.margin, origin, pendingMap],
  );

  return (
    <FlatListScreen
      title={origin}
      flatListStyle={{ gap: theme.paddingXS }}
      autoFocus={false}
      onPressBack={() => navigation.goBack()}
      beforeListItem={renderBeforeListItem()}
      items={accountItems}
      searchFunction={searchFunction}
      placeholder={i18n.placeholder.accountName}
      renderListEmptyComponent={() => (
        <EmptyList
          icon={Users}
          title={i18n.emptyScreen.manageDAppDetailEmptyTitle}
          message={i18n.emptyScreen.manageDAppDetailEmptyMessage}
        />
      )}
      rightIconOption={rightIconOption}
      renderItem={renderItem}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dAppAccessDetailMoreOptions}
          setModalVisible={setModalVisible}
        />
      }
    />
  );
};

export const DAppAccessDetailScreen = ({
  route: {
    params: { origin, accountAuthType },
  },
}: DAppAccessDetailProps) => {
  const authInfo: undefined | AuthUrlInfo = useSelector((state: RootState) => state.settings.authUrls[origin]);

  return <>{!!authInfo && <Content accountAuthType={accountAuthType} origin={origin} authInfo={authInfo} />}</>;
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
