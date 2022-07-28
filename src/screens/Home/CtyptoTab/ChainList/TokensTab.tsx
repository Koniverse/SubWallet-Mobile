import React from 'react';
import {FlatList, ListRenderItemInfo, RefreshControl} from 'react-native';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { getTokenBalanceItems } from 'utils/index';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import * as Tabs from 'react-native-collapsible-tab-view';
import {ColorMap} from "styles/color";
import {useRefresh} from "hooks/useRefresh";

interface Props {
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressTokenItem: (tokenName: string, tokenSymbol: string, info?: AccountInfoByNetwork) => void;
}

export const TokensTab = ({ networkBalanceMaps, onPressTokenItem, accountInfoByNetworkMap }: Props) => {
  const tokenBalanceItems = getTokenBalanceItems(networkBalanceMaps);
  const [isRefreshing, startRefreshing] = useRefresh();
  const renderItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    if (!item.isReady) {
      return <ChainBalanceSkeleton key={`${item.symbol}-${item.selectNetworkKey}`} />;
    }

    const info = accountInfoByNetworkMap[item.defaultNetworkKey || item.selectNetworkKey];

    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.selectNetworkKey}`}
        networkDisplayName={info.networkDisplayName}
        tokenBalanceValue={item.balanceValue}
        convertedBalanceValue={item.convertedBalanceValue}
        selectNetworkKey={item.selectNetworkKey}
        tokenBalanceSymbol={item.displayedSymbol}
        defaultNetworkKey={item.defaultNetworkKey}
        onPress={() => onPressTokenItem(item.displayedSymbol, item.symbol, info)}
      />
    );
  };

  return (
    <Tabs.FlatList
      nestedScrollEnabled
      style={{ paddingTop: 8, backgroundColor: ColorMap.dark1 }}
      keyboardShouldPersistTaps={'handled'}
      data={tokenBalanceItems}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl tintColor={ColorMap.light} refreshing={isRefreshing} onRefresh={startRefreshing} />
      }
    />
  );
};
