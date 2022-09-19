import React, { useEffect, useReducer, useState } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { disableNetworkMap, enableNetworkMap } from '../messaging';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Warning } from 'components/Warning';
import { FlatListScreen } from 'components/FlatListScreen';

interface Props {}

let networkKeys: Array<string> | undefined;

let cachePendingNetworkMap: Record<string, boolean> = {};

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(network => network.chain.toLowerCase().includes(searchString.toLowerCase()));
};

const processNetworkMap = (
  networkMap: Record<string, NetworkJson>,
  pendingKeys = Object.keys(cachePendingNetworkMap),
  updateKeys = false,
): NetworkJson[] => {
  if (!networkKeys || updateKeys) {
    networkKeys = Object.keys(networkMap).sort((a, b) => {
      const aActive = pendingKeys.includes(a) ? cachePendingNetworkMap[a] : networkMap[a]?.active;
      const bActive = pendingKeys.includes(b) ? cachePendingNetworkMap[b] : networkMap[b]?.active;

      if (aActive === bActive) {
        return 0;
      } else if (aActive) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  return networkKeys.map(key => networkMap[key]);
};

export const NetworksSetting = ({}: Props) => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const [pendingNetworkMap, setPendingNetworkMap] = useState<Record<string, boolean>>(cachePendingNetworkMap);
  const [currentNetworkList, setCurrentNetworkList] = useState(processNetworkMap(networkMap));

  useEffect(() => {
    setPendingNetworkMap(prevPendingNetworkMap => {
      Object.entries(prevPendingNetworkMap).forEach(([key, val]) => {
        if (networkMap[key]?.active === val) {
          // @ts-ignore
          delete prevPendingNetworkMap[key];
        }
      });

      return { ...prevPendingNetworkMap };
    });
  }, [networkMap]);

  useEffect(() => {
    setCurrentNetworkList(processNetworkMap(networkMap, Object.keys(pendingNetworkMap)));
  }, [networkMap, pendingNetworkMap]);

  useEffect(() => {
    cachePendingNetworkMap = pendingNetworkMap;
  }, [pendingNetworkMap]);

  const onToggleItem = (item: NetworkJson) => {
    setPendingNetworkMap({ ...pendingNetworkMap, [item.key]: !item.active });
    const reject = () => {
      console.warn('Toggle network request failed!');
      // @ts-ignore
      delete pendingNetworkMap[item.key];
      setPendingNetworkMap({ ...pendingNetworkMap });
    };

    if (item.active) {
      disableNetworkMap(item.key).catch(reject);
    } else {
      enableNetworkMap(item.key).catch(reject);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<NetworkJson>) => {
    return (
      <NetworkAndTokenToggleItem
        isDisableSwitching={
          item.key === 'polkadot' || item.key === 'kusama' || Object.keys(pendingNetworkMap).includes(item.key)
        }
        key={`${item.key}-${item.chain}`}
        itemName={item.chain}
        itemKey={item.key}
        // @ts-ignore
        isEnabled={
          Object.keys(pendingNetworkMap).includes(item.key) ? pendingNetworkMap[item.key] : networkMap[item.key].active
        }
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return (
      <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noNetworkAvailable} isDanger={false} />
    );
  };

  return (
    <FlatListScreen
      items={currentNetworkList}
      title={i18n.title.networkSetting}
      autoFocus={false}
      renderListEmptyComponent={renderListEmptyComponent}
      filterFunction={filterFunction}
      renderItem={renderItem}
    />
  );
};
