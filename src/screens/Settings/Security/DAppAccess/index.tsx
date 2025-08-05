import React, { useCallback, useMemo, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';
import { DotsThree, GlobeSimple, Plugs, PlugsConnected, X } from 'phosphor-react-native';
import { MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { changeAuthorizationAll, forgetAllSite } from 'messaging/index';
import { updateAuthUrls } from 'stores/updater';
import i18n from 'utils/i18n/i18n';
import { EmptyList } from 'components/EmptyList';
import DappAccessItem from 'components/design-system-ui/web3-block/DappAccessItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { AccountProxy } from '@subwallet/extension-base/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isSubstrateAddress, isTonAddress } from '@subwallet/keyring/utils/address';

function searchFunction(items: AuthUrlInfo[], searchString: string) {
  return items.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

function getDAppItems(authUrlMap: Record<string, AuthUrlInfo>): AuthUrlInfo[] {
  return Object.values(authUrlMap);
}

export function getAccountCount(item: AuthUrlInfo, accountProxies: AccountProxy[]): number {
  const authTypes = item.accountAuthTypes;

  return accountProxies.filter(ap => {
    return ap.accounts.some(account => {
      if (isEthereumAddress(account.address)) {
        return authTypes.includes('evm') && item.isAllowedMap[account.address];
      }

      if (isSubstrateAddress(account.address)) {
        return authTypes.includes('substrate') && item.isAllowedMap[account.address];
      }

      if (isTonAddress(account.address)) {
        return authTypes.includes('ton') && item.isAllowedMap[account.address];
      }

      return false;
    });
  }).length;
}

enum FilterValue {
  SUBSTRATE = 'substrate',
  ETHEREUM = 'ethereum',
  BLOCKED = 'blocked',
  CONNECTED = 'connected',
}

const filterFunction = (items: AuthUrlInfo[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.SUBSTRATE:
          if (item.accountAuthTypes?.includes('substrate')) {
            return true;
          }
          break;
        case FilterValue.ETHEREUM:
          if (item.accountAuthTypes?.includes('evm')) {
            return true;
          }
          break;
        case FilterValue.BLOCKED:
          if (!item.isAllowed) {
            return true;
          }
          break;
        case FilterValue.CONNECTED:
          if (item.isAllowed) {
            return true;
          }
          break;
      }
    }
    return false;
  });
};

export const DAppAccessScreen = () => {
  const authUrlMap = useSelector((state: RootState) => state.settings.authUrls);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const navigation = useNavigation<RootNavigationProps>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const theme = useSubWalletTheme().swThemes;
  const dAppItems = useMemo<AuthUrlInfo[]>(() => {
    return getDAppItems(authUrlMap);
  }, [authUrlMap]);
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.substrateDApp, value: FilterValue.SUBSTRATE },
    { label: i18n.filterOptions.evmDApp, value: FilterValue.ETHEREUM },
    { label: i18n.filterOptions.blockedDApp, value: FilterValue.BLOCKED },
    { label: i18n.filterOptions.connectedDApp, value: FilterValue.CONNECTED },
  ];

  const rightIconOption = useMemo(() => {
    return {
      icon: DotsThree,
      onPress: () => setModalVisible(true),
    };
  }, []);

  const dAppAccessMoreOptions = useMemo(() => {
    return [
      {
        key: 'forgetAll',
        name: i18n.common.forgetAll,
        icon: X,
        backgroundColor: theme['yellow-6'],
        onPress: () => {
          forgetAllSite(updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        key: 'disconnectAll',
        name: i18n.common.disconnectAll,
        icon: Plugs,
        backgroundColor: theme['gray-3'],
        onPress: () => {
          changeAuthorizationAll(false, updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
      {
        key: 'connectAll',
        name: i18n.common.connectAll,
        icon: PlugsConnected,
        backgroundColor: theme['green-6'],
        onPress: () => {
          changeAuthorizationAll(true, updateAuthUrls).catch(console.error);
          setModalVisible(false);
        },
      },
    ];
  }, [theme]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AuthUrlInfo>) => {
      return (
        <DappAccessItem
          containerStyle={{ marginBottom: theme.marginXS }}
          item={item}
          accountCount={getAccountCount(item, accountProxies)}
          onPress={() => {
            navigation.navigate('DAppAccessDetail', {
              origin: item.id,
              accountAuthTypes: item.accountAuthTypes,
            });
          }}
        />
      );
    },
    [accountProxies, navigation, theme.marginXS],
  );

  return (
    <FlatListScreen
      title={i18n.header.manageWebsiteAccess}
      autoFocus={false}
      items={dAppItems}
      onPressBack={() => navigation.goBack()}
      searchFunction={searchFunction}
      placeholder={i18n.placeholder.searchOrEnterWebsite}
      renderListEmptyComponent={() => (
        <EmptyList
          icon={GlobeSimple}
          title={i18n.emptyScreen.manageDAppEmptyTitle}
          message={i18n.emptyScreen.manageDAppEmptyMessage}
        />
      )}
      rightIconOption={rightIconOption}
      renderItem={renderItem}
      isShowFilterBtn
      filterFunction={filterFunction}
      filterOptions={FILTER_OPTIONS}
      estimatedItemSize={60}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dAppAccessMoreOptions}
          setModalVisible={setModalVisible}
        />
      }
    />
  );
};
