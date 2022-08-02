import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import * as Tabs from 'react-native-collapsible-tab-view';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';

interface Props {
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (tokenSymbol: string, tokenDisplayName: string) => void;
}

function getItems(selectedNetworkInfo: AccountInfoByNetwork, selectedBalanceInfo: BalanceInfo): TokenBalanceItemType[] {
  const items: TokenBalanceItemType[] = [];

  items.push({
    logoKey: selectedNetworkInfo.networkKey,
    networkKey: selectedNetworkInfo.networkKey,
    balanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    convertedBalanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    symbol: selectedBalanceInfo?.symbol || 'Unit',
    displayedSymbol: selectedBalanceInfo?.symbol || 'Unit',
    isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
  });

  if (selectedBalanceInfo && selectedBalanceInfo.childrenBalances && selectedBalanceInfo.childrenBalances.length) {
    selectedBalanceInfo.childrenBalances.forEach(item => {
      items.push({
        networkKey: selectedNetworkInfo.networkKey,
        logoKey: item.symbol,
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
    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.networkKey}`}
        networkDisplayName={selectedNetworkInfo.networkDisplayName}
        onPress={() => onPressTokenItem(item.symbol, item.displayedSymbol)}
        {...item}
      />
    );
  }

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
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
