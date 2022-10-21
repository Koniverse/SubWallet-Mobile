import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo } from 'react-native';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { NetworkConfigItem } from 'components/NetworkConfigItem';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';

const filterFunction = (items: NetworkJson[], searchString: string) => {
  return items.filter(network => network.chain.toLowerCase().includes(searchString.toLowerCase()));
};

export const NetworkConfig = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

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
      items={Object.values(networkMap)}
      renderItem={renderItem}
      autoFocus={false}
      filterFunction={filterFunction}
      renderListEmptyComponent={renderListEmptyComponent}
    />
  );
};
