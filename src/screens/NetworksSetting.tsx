import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListChecks, Plus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, NetworksSettingProps } from 'routes/index';
import { updateChainActiveState } from 'messaging/index';
import {
  _isChainEvmCompatible,
  _isCustomChain,
  _isSubstrateChain,
} from '@subwallet/extension-base/services/chain-service/utils';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import useChainInfoWithStateAndStatus, {
  ChainInfoWithStateAnhStatus,
} from 'hooks/chain/useChainInfoWithStateAndStatus';

let chainKeys: Array<string> | undefined;

let cachePendingChainMap: Record<string, boolean> = {};

enum FilterValue {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  CUSTOM = 'custom',
  SUBSTRATE = 'substrate',
  EVM = 'evm',
}

const searchFunction = (items: ChainInfoWithStateAnhStatus[], searchString: string) => {
  if (!searchString) {
    return items;
  }

  return items.filter(network => network && network.name.toLowerCase().includes(searchString.toLowerCase()));
};

const filterFunction = (items: ChainInfoWithStateAnhStatus[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.CUSTOM:
          if (_isCustomChain(item.slug)) {
            return true;
          }
          break;
        case FilterValue.ENABLED:
          if (item.active) {
            return true;
          }
          break;
        case FilterValue.DISABLED:
          if (!item.active) {
            return true;
          }
          break;
        case FilterValue.SUBSTRATE:
          if (_isSubstrateChain(item)) {
            return true;
          }
          break;
        case FilterValue.EVM:
          if (_isChainEvmCompatible(item)) {
            return true;
          }
          break;
      }
    }
    return false;
  });
};

const processChainMap = (
  chainInfoMap: Record<string, ChainInfoWithStateAnhStatus>,
  pendingKeys = Object.keys(cachePendingChainMap),
  updateKeys = false,
): ChainInfoWithStateAnhStatus[] => {
  if (!chainKeys || updateKeys) {
    chainKeys = Object.keys(chainInfoMap)
      .filter(key => Object.keys(chainInfoMap[key].providers).length > 0)
      .sort((a, b) => {
        const aActive = pendingKeys.includes(a) ? cachePendingChainMap[a] : chainInfoMap[a].active;
        const bActive = pendingKeys.includes(b) ? cachePendingChainMap[b] : chainInfoMap[b].active;

        if (aActive === bActive) {
          return 0;
        } else if (aActive) {
          return -1;
        } else {
          return 1;
        }
      });
  }

  return chainKeys.map(key => chainInfoMap[key]);
};

export const NetworksSetting = ({ route: { params } }: NetworksSettingProps) => {
  const defaultSearchString = params?.chainName;
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useChainInfoWithStateAndStatus();
  const [isToggleItem, setToggleItem] = useState(false);
  const [pendingChainMap, setPendingChainMap] = useState<Record<string, boolean>>(cachePendingChainMap);
  const [currentChainList, setCurrentChainList] = useState(processChainMap(chainInfoMap));
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.evmChains, value: FilterValue.EVM },
    { label: i18n.filterOptions.substrateChains, value: FilterValue.SUBSTRATE },
    { label: i18n.filterOptions.customChains, value: FilterValue.CUSTOM },
    { label: i18n.filterOptions.enabledChains, value: FilterValue.ENABLED },
    { label: i18n.filterOptions.disabledChains, value: FilterValue.DISABLED },
  ];

  useEffect(() => {
    setPendingChainMap(prevPendingChainMap => {
      const _prevPendingChainMap = { ...prevPendingChainMap };
      Object.entries(_prevPendingChainMap).forEach(([key, val]) => {
        if (chainInfoMap[key].active === val) {
          // @ts-ignore
          delete _prevPendingChainMap[key];
        }
      });

      return _prevPendingChainMap;
    });
  }, [chainInfoMap]);

  useEffect(() => {
    setCurrentChainList(processChainMap(chainInfoMap, Object.keys(pendingChainMap), !isToggleItem));
  }, [chainInfoMap, isToggleItem, pendingChainMap]);

  useEffect(() => {
    cachePendingChainMap = pendingChainMap;
  }, [pendingChainMap]);

  const onToggleItem = (item: ChainInfoWithStateAnhStatus) => {
    setToggleItem(true);
    setPendingChainMap({ ...pendingChainMap, [item.slug]: !item.active });
    const reject = () => {
      console.warn('Toggle network request failed!');
      // @ts-ignore
      delete pendingNetworkMap[item.key];
      setPendingChainMap({ ...pendingChainMap });
    };

    updateChainActiveState(item.slug, !item.active)
      .then(result => {
        if (!result) {
          reject();
        }
      })
      .catch(reject);
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChainInfoWithStateAnhStatus>) => {
    return (
      <NetworkAndTokenToggleItem
        isDisableSwitching={
          item.slug === 'polkadot' || item.slug === 'kusama' || Object.keys(pendingChainMap).includes(item.slug)
        }
        key={`${item.slug}-${item.name}`}
        itemName={item.name}
        itemKey={item.slug}
        connectionStatus={item.connectionStatus}
        // @ts-ignore
        isEnabled={
          Object.keys(pendingChainMap).includes(item.slug)
            ? pendingChainMap[item.slug]
            : chainInfoMap[item.slug]?.active || false
        }
        onValueChange={() => onToggleItem(item)}
        showEditButton
        onPressEditBtn={() => {
          navigation.navigate('NetworkSettingDetail', { chainSlug: item.slug });
          setToggleItem(false);
        }}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={ListChecks}
        title={i18n.emptyScreen.networkSettingsTitle}
        message={i18n.emptyScreen.networkSettingsMessage}
        addBtnLabel={i18n.header.importNetwork}
        onPressAddBtn={() => {
          navigation.navigate('ImportNetwork');
        }}
      />
    );
  };

  return (
    <FlatListScreen
      rightIconOption={{
        icon: Plus,
        onPress: () => {
          navigation.navigate('ImportNetwork');
          setToggleItem(false);
        },
      }}
      defaultSearchString={defaultSearchString}
      onPressBack={() => navigation.goBack()}
      items={currentChainList}
      title={i18n.header.manageNetworks}
      placeholder={i18n.placeholder.searchNetwork}
      autoFocus={false}
      renderListEmptyComponent={renderListEmptyComponent}
      searchFunction={searchFunction}
      renderItem={renderItem}
      filterOptions={FILTER_OPTIONS}
      isShowFilterBtn
      filterFunction={filterFunction}
      isShowListWrapper={true}
    />
  );
};
