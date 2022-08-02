import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { getTokenBalanceItems } from 'utils/index';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';

interface Props {
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressTokenItem: (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => void;
}

export const TokensTab = ({ networkBalanceMaps, onPressTokenItem, accountInfoByNetworkMap }: Props) => {
  const tokenBalanceItems = getTokenBalanceItems(networkBalanceMaps);
  const [isRefresh, refresh] = useRefresh();
  const renderItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    if (!item.isReady) {
      return <ChainBalanceSkeleton key={`${item.symbol}-${item.selectNetworkKey}`} />;
    }

    const info = accountInfoByNetworkMap[item.defaultNetworkKey || item.selectNetworkKey];

    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.selectNetworkKey}`}
        networkDisplayName={info.networkDisplayName}
        balanceValue={item.balanceValue}
        convertedBalanceValue={item.convertedBalanceValue}
        logoKey={item.selectNetworkKey}
        symbol={item.displayedSymbol}
        defaultLogoKey={item.defaultNetworkKey}
        onPress={() => onPressTokenItem(item.symbol, item.displayedSymbol, info)}
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
