import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { Warning } from 'components/Warning';
import { disableNetworkMap, enableNetworkMap } from '../messaging';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';

interface Props {
  modalVisible: boolean;
  onPressBack: () => void;
  onChangeModalVisible: () => void;
}

export const NetworksSetting = ({ onPressBack, modalVisible, onChangeModalVisible }: Props) => {
  const { networkMap } = useSelector((state: RootState) => state);
  const [searchString, setSearchString] = useState('');

  const onToggleItem = useCallback((item: NetworkJson) => {
    if (item.active) {
      disableNetworkMap(item.key).catch(console.error);
    } else {
      enableNetworkMap(item.key).catch(console.error);
    }
  }, []);

  const renderItem = ({ item }: ListRenderItemInfo<NetworkJson>) => {
    return (
      <NetworkAndTokenToggleItem
        key={`${item.key}-${item.chain}`}
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
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        onPressBack={onPressBack}
        title={'Network Setting'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={Object.values(filteredNetworkMap)}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => `${item.key}-${item.chain}`}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
