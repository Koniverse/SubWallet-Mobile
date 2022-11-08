import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo } from 'react-native';
import { NETWORK_STATUS, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { NetworkConfigItem } from 'components/NetworkConfigItem';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(network => network.chain.toLowerCase().includes(searchString.toLowerCase()));
};

const processNetworkMap = (networkMap: Record<string, NetworkJson>) => {
  return Object.values(networkMap).sort((a, b) => {
    const aApiStatus = a.apiStatus;
    const bApiStatus = b.apiStatus;

    if (
      aApiStatus === bApiStatus ||
      (aApiStatus && aApiStatus !== NETWORK_STATUS.CONNECTED) ||
      (bApiStatus && bApiStatus !== NETWORK_STATUS.CONNECTED)
    ) {
      return 0;
    } else if (aApiStatus === NETWORK_STATUS.CONNECTED) {
      return -1;
    } else {
      return 1;
    }
  });
};

export const NetworkConfig = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const sortedNetworkConfigList = processNetworkMap(networkMap);

  const renderItem = ({ item }: ListRenderItemInfo<NetworkJson>) => {
    return (
      <NetworkConfigItem
        item={item}
        onPressConfigDetailButton={() => navigation.navigate('NetworkConfigDetail', { key: item.key })}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return (
      <Warning
        style={{ marginHorizontal: 16 }}
        title={i18n.warningTitle.warning}
        message={i18n.warningMessage.noNetworkAvailable}
        isDanger={false}
      />
    );
  };

  return (
    <FlatListScreen
      title={i18n.title.networks}
      items={sortedNetworkConfigList}
      renderItem={renderItem}
      autoFocus={false}
      filterFunction={filterFunction}
      renderListEmptyComponent={renderListEmptyComponent}
    />
  );
};
