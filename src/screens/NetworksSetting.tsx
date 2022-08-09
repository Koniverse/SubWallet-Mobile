import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Text } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SelectScreen } from 'components/SelectScreen';
import i18n from 'utils/i18n/i18n';
import { disableNetworkMap, enableNetworkMap } from '../messaging';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';

interface Props {}

let networkKeys: Array<string> | undefined;

export const NetworksSetting = ({}: Props) => {
  const navigation = useNavigation();
  const { networkMap } = useSelector((state: RootState) => state);
  const [searchString, setSearchString] = useState('');
  const [currentNetworkMap, setCurrentNetworkMap] = useState<Record<string, NetworkJson>>({});
  const [filteredNetworkList, setFilteredNetworkList] = useState<Array<NetworkJson>>([]);
  const [pendingNetworkMap, setPendingNetworkMap] = useState<Record<string, boolean>>({});
  const [needUpdateList, setNeedUpdateList] = useState(true);

  useEffect(() => {
    const newNetworkMap = {};
    if (!networkKeys || needUpdateList || networkKeys.length === 0) {
      const pendingKeys = Object.keys(pendingNetworkMap);
      networkKeys = Object.keys(networkMap).sort((a, b) => {
        const aActive = pendingKeys.includes(a) ? pendingNetworkMap[a] : networkMap[a]?.active;
        const bActive = pendingKeys.includes(b) ? pendingNetworkMap[b] : networkMap[b]?.active;

        if (aActive === bActive) {
          return 0;
        } else if (aActive) {
          return -1;
        } else {
          return 1;
        }
      });
      setNeedUpdateList(false);
    }
    networkKeys.forEach(key => {
      // @ts-ignore
      newNetworkMap[key] = networkMap[key];
    });
    setCurrentNetworkMap({ ...newNetworkMap });

    Object.entries(pendingNetworkMap).forEach(([key, val]) => {
      if (networkMap[key]?.active === val) {
        // @ts-ignore
        delete pendingNetworkMap[key];
        setPendingNetworkMap({ ...pendingNetworkMap });
      }
    });
  }, [needUpdateList, networkMap, pendingNetworkMap]);

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
        isEnabled={Object.keys(pendingNetworkMap).includes(item.key) ? pendingNetworkMap[item.key] : item.active}
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Text>{i18n.warningMessage.noNetworkAvailable}</Text>;
  };

  useEffect(() => {
    setFilteredNetworkList(
      Object.values(currentNetworkMap).filter(network =>
        network.chain.toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
  }, [currentNetworkMap, searchString]);

  return (
    <SelectScreen
      onPressBack={() => navigation.goBack()}
      title={'Network Setting'}
      searchString={searchString}
      onChangeSearchText={setSearchString}>
      <FlatList
        style={{ ...ScrollViewStyle }}
        keyboardShouldPersistTaps={'handled'}
        data={filteredNetworkList}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmptyComponent}
        keyExtractor={item => `${item.key}-${item.chain}`}
      />
    </SelectScreen>
  );
};
