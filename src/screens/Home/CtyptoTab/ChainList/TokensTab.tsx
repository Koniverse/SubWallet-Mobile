import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { getTokenBalanceItems } from 'utils/index';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';

interface Props {
  networkBalanceMap: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressTokenItem: (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => void;
}

export const TokensTab = ({ networkBalanceMap, onPressTokenItem, accountInfoByNetworkMap }: Props) => {
  const tokenBalanceItems = getTokenBalanceItems(networkBalanceMap);
  const [isRefresh, refresh] = useRefresh();
  const renderItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    const info = accountInfoByNetworkMap[item.networkKey];

    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.networkKey}`}
        networkDisplayName={info.networkDisplayName}
        onPress={() => onPressTokenItem(item.symbol, item.displayedSymbol, info)}
        {...item}
      />
    );
  };

  return (
    <Tabs.FlatList
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={tokenBalanceItems}
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
