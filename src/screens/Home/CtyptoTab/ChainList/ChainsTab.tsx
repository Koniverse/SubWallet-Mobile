import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';

interface Props {
  networkKeys: string[];
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
}

export const ChainsTab = ({ networkKeys, onPressChainItem, networkBalanceMaps, accountInfoByNetworkMap }: Props) => {
  const [isRefresh, refresh] = useRefresh();
  const renderItem = ({ item: networkKey }: ListRenderItemInfo<string>) => {
    const info = accountInfoByNetworkMap[networkKey];
    const balanceInfo = networkBalanceMaps[networkKey];
    if (!balanceInfo || !balanceInfo.isReady) {
      return <ChainBalanceSkeleton key={info.key} />;
    } else {
      return (
        <ChainBalance
          key={info.key}
          accountInfo={info}
          onPress={() => onPressChainItem(info, balanceInfo)}
          balanceInfo={balanceInfo}
        />
      );
    }
  };

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={networkKeys}
      renderItem={renderItem}
      refreshControl={<RefreshControl tintColor={ColorMap.light} refreshing={isRefresh} onRefresh={refresh} />}
    />
  );
};
