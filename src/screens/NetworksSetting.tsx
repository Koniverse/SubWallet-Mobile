import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { Warning } from 'components/Warning';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { SelectScreen } from 'components/SelectScreen';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import useFetchNetworkMap from 'hooks/screen/NetworkSetting/useFetchNetworkMap';
import i18n from 'utils/i18n/i18n';
import { disableNetworkMap, enableNetworkMap } from '../messaging';

interface Props {
  modalVisible: boolean;
  onPressBack: () => void;
  onChangeModalVisible: () => void;
}

export const NetworksSetting = ({ onPressBack, modalVisible, onChangeModalVisible }: Props) => {
  const { parsedNetworkMap: networkMap } = useFetchNetworkMap();
  const [searchString, setSearchString] = useState('');
  const [currentNetworkMap, setCurrentNetworkMap] = useState<Record<string, NetworkJson>>({});
  const [filteredNetworkList, setFilteredNetworkList] = useState<Array<NetworkJson>>([]);
  const [pendingNetworkList, setPendingNetworkList] = useState({});

  useEffect(() => {
    setCurrentNetworkMap({ ...networkMap });
    Object.entries(pendingNetworkList).forEach(([key, val]) => {
      if (networkMap[key]?.active === val) {
        // @ts-ignore
        delete pendingNetworkList[key];
        setPendingNetworkList({ ...pendingNetworkList });
      }
    });
  }, [networkMap, pendingNetworkList]);

  const onToggleItem = (item: NetworkJson) => {
    setPendingNetworkList({ ...pendingNetworkList, [item.key]: !item.active });
    const reject = () => {
      console.warn('Toggle network request failed!');
      // @ts-ignore
      delete pendingNetworkList[item.key];
      setPendingNetworkList({ ...pendingNetworkList });
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
          item.key === 'polkadot' || item.key === 'kusama' || Object.keys(pendingNetworkList).includes(item.key)
        }
        key={`${item.key}-${item.chain}`}
        itemName={item.chain}
        itemKey={item.key}
        // @ts-ignore
        isEnabled={Object.keys(pendingNetworkList).includes(item.key) ? pendingNetworkList[item.key] : item.active}
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.warningMessage.noNetworkAvailable} isDanger={false} />;
  };

  useEffect(() => {
    setFilteredNetworkList(
      Object.values(currentNetworkMap).filter(network =>
        network.chain.toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
  }, [currentNetworkMap, searchString]);

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
          data={filteredNetworkList}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => `${item.key}-${item.chain}`}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
