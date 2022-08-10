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
  networkBalanceMap: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
}

export const ChainsTab = ({ networkKeys, onPressChainItem, networkBalanceMap, accountInfoByNetworkMap }: Props) => {
  const [isRefresh, refresh] = useRefresh();
  const renderItem = ({ item: networkKey }: ListRenderItemInfo<string>) => {
    const info = accountInfoByNetworkMap[networkKey];
    const balanceInfo = networkBalanceMap[networkKey];
    return (
      <ChainBalance
        key={info.key}
        accountInfo={info}
        onPress={() => onPressChainItem(info, balanceInfo)}
        balanceInfo={balanceInfo}
      />
    );
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
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: ColorMap.dark2 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={refresh}
        />
      }
    />
  );
};
