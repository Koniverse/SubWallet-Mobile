import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';

interface Props {
  networkKeys: string[];
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  networkBalanceMap: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
}

export const ChainsTab = ({
  networkKeys,
  onPressChainItem,
  networkBalanceMap,
  accountInfoByNetworkMap,
  isRefresh,
  refresh,
  refreshTabId,
}: Props) => {
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
          style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'two' ? 1 : 0 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => refresh('two')}
        />
      }
    />
  );
};
