import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo } from 'react-native';
import { NetworkConfigItem } from 'components/NetworkConfigItem';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';

const filterFunction = (items: _ChainInfo[], searchString: string) => {
  return items.filter(network => network.name.toLowerCase().includes(searchString.toLowerCase()));
};

const processNetworkMap = (networkMap: Record<string, _ChainInfo>) => {
  return Object.values(networkMap).sort((a, b) => {
    const aApiStatus = a.chainStatus;
    const bApiStatus = b.chainStatus;

    if (
      aApiStatus === bApiStatus ||
      (aApiStatus && aApiStatus !== _ChainStatus.ACTIVE) ||
      (bApiStatus && bApiStatus !== _ChainStatus.ACTIVE)
    ) {
      return 0;
    } else if (aApiStatus === _ChainStatus.ACTIVE) {
      return -1;
    } else {
      return 1;
    }
  });
};

export const NetworkConfig = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const sortedNetworkConfigList = processNetworkMap(networkMap);

  const renderItem = ({ item }: ListRenderItemInfo<_ChainInfo>) => {
    return (
      <NetworkConfigItem
        item={item}
        onPressConfigDetailButton={() => navigation.navigate('NetworkConfigDetail', { key: item.slug })}
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
      onPressBack={() => navigation.goBack()}
      title={i18n.title.networks}
      items={sortedNetworkConfigList}
      renderItem={renderItem}
      autoFocus={false}
      searchFunction={filterFunction}
      renderListEmptyComponent={renderListEmptyComponent}
    />
  );
};
