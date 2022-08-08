import React, { useCallback, useEffect, useState } from 'react';
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

function getDefaultSettingNetworkMap(networkMap: Record<string, NetworkJson>) {
  const defaultNetworkSettingMap: Record<string, boolean> = {};
  Object.values(networkMap).forEach(network => (defaultNetworkSettingMap[network.key] = network.active));
  return defaultNetworkSettingMap;
}

export const NetworksSetting = ({ onPressBack, modalVisible, onChangeModalVisible }: Props) => {
  const { parsedNetworkMap: networkMap } = useFetchNetworkMap();
  const [searchString, setSearchString] = useState('');
  const [settingNetworkMap, setSettingNetworkMap] = useState<Record<string, boolean>>({});
  const deps = JSON.stringify(networkMap);
  useEffect(() => {
    if (Object.values(networkMap) && Object.values(networkMap).length) {
      setSettingNetworkMap(getDefaultSettingNetworkMap(networkMap));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  const onToggleItem = (item: NetworkJson) => {
    setSettingNetworkMap(prevState => {
      return {
        ...prevState,
        [item.key]: !prevState[item.key],
      };
    });
  };

  const _onPressBack = async () => {
    const networkList = Object.values(networkMap);
    onPressBack();

    for (let i = 0; i < networkList.length; i++) {
      if (settingNetworkMap[networkList[i].key] !== networkList[i].active) {
        if (settingNetworkMap[networkList[i].key]) {
          await enableNetworkMap(networkList[i].key);
        } else {
          await disableNetworkMap(networkList[i].key);
        }
      }
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<NetworkJson>) => {
    return (
      <NetworkAndTokenToggleItem
        isDisableSwitching={item.key === 'polkadot' || item.key === 'kusama'}
        key={`${item.key}-${item.chain}`}
        itemName={item.chain}
        itemKey={item.key}
        isEnabled={settingNetworkMap[item.key]}
        onValueChange={() => onToggleItem(item)}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.warningMessage.noNetworkAvailable} isDanger={false} />;
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

  const filteredNetworkMap = Object.values(filterNetwork());

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <SelectScreen
        onPressBack={_onPressBack}
        title={'Network Setting'}
        searchString={searchString}
        onChangeSearchText={setSearchString}>
        <FlatList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredNetworkMap}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => `${item.key}-${item.chain}`}
        />
      </SelectScreen>
    </SubWalletFullSizeModal>
  );
};
