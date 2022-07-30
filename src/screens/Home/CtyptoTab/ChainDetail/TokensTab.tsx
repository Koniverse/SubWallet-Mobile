import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import * as Tabs from 'react-native-collapsible-tab-view';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';

interface Props {
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (tokenName: string, tokenSymbol: string) => void;
}

function getItems(selectedNetworkInfo: AccountInfoByNetwork, selectedBalanceInfo: BalanceInfo): TokenBalanceItemType[] {
  const items: TokenBalanceItemType[] = [];

  items.push({
    selectNetworkKey: selectedNetworkInfo.networkKey,
    balanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    convertedBalanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    symbol: selectedBalanceInfo?.symbol || 'Unit',
    displayedSymbol: selectedBalanceInfo?.symbol || 'Unit',
    isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
  });

  if (selectedBalanceInfo && selectedBalanceInfo.childrenBalances && selectedBalanceInfo.childrenBalances.length) {
    selectedBalanceInfo.childrenBalances.forEach(item => {
      items.push({
        selectNetworkKey: selectedNetworkInfo.networkKey,
        balanceValue: item.balanceValue,
        convertedBalanceValue: item.balanceValue,
        symbol: item.symbol,
        displayedSymbol: item.symbol,
        isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
      });
    });
  }

  return items;
}

export const TokensTab = ({ selectedNetworkInfo, selectedBalanceInfo, onPressTokenItem }: Props) => {
  const items = getItems(selectedNetworkInfo, selectedBalanceInfo);
  const [isRefresh, refresh] = useRefresh();
  function renderItem({ item }: ListRenderItemInfo<TokenBalanceItemType>) {
    if (!item.isReady) {
      return <ChainBalanceSkeleton key={`${item.symbol}-${item.selectNetworkKey}`} />;
    }

    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.selectNetworkKey}`}
        networkDisplayName={selectedNetworkInfo.networkDisplayName}
        tokenBalanceValue={item.balanceValue}
        convertedBalanceValue={item.convertedBalanceValue}
        selectNetworkKey={item.selectNetworkKey}
        tokenBalanceSymbol={item.displayedSymbol}
        defaultNetworkKey={item.defaultNetworkKey}
        onPress={() => onPressTokenItem(item.displayedSymbol, item.symbol)}
      />
    );
  }

  return (
    <Tabs.FlatList
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      nestedScrollEnabled
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={items}
      renderItem={renderItem}
      refreshControl={<RefreshControl tintColor={ColorMap.light} refreshing={isRefresh} onRefresh={refresh} />}
    />
  );
};
