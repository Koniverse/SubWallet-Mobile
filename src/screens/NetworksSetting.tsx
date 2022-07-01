import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { Warning } from 'components/Warning';
import { disableNetworkMap, enableNetworkMap } from '../messaging';
import { useToast } from 'react-native-toast-notifications';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SelectScreen } from 'components/SelectScreen';

export const NetworksSetting = () => {
  const toast = useToast();
  const { networkMap } = useSelector((state: RootState) => state);
  const [searchString, setSearchString] = useState('');

  const handleShowStateConfirm = useCallback(
    (item: NetworkJson, resp: boolean) => {
      if (resp) {
        toast.show(`${item.chain} has ${item.active ? 'disconnected' : 'connected'} successfully`);
      } else {
        toast.show(`${item.chain} has failed to ${item.active ? 'disconnect' : 'connect'}`);
      }
    },
    [toast],
  );

  const onToggleItem = useCallback(
    (item: NetworkJson) => {
      if (item.active) {
        disableNetworkMap(item.key)
          .then(({ success }) => handleShowStateConfirm(item, success))
          .catch(console.error);
      } else {
        enableNetworkMap(item.key)
          .then(resp => handleShowStateConfirm(item, resp))
          .catch(console.error);
      }
    },
    [handleShowStateConfirm],
  );

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <NetworkAndTokenToggleItem
        key={item.key}
        itemName={item.chain}
        itemKey={item.key}
        isEnabled={item.active}
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={'No network'} isDanger={false} />;
  };

  const filterNetwork = useCallback(() => {
    const _filteredNetworkMap: Record<string, NetworkJson> = {};

    Object.entries(networkMap).forEach(([key, network]) => {
      if (network.chain.toLowerCase().includes(searchString.toLowerCase())) {
        _filteredNetworkMap[key] = network;
      }
    });

    return _filteredNetworkMap;
  }, [networkMap, searchString]);

  const filteredNetworkMap = filterNetwork();

  return (
    <SelectScreen title={'Network Setting'} searchString={searchString} onChangeSearchText={setSearchString}>
      <FlatList
        style={{ ...ScrollViewStyle }}
        keyboardShouldPersistTaps={'handled'}
        data={Object.values(filteredNetworkMap)}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmptyComponent}
        keyExtractor={item => item.key}
      />
    </SelectScreen>
  );
};
