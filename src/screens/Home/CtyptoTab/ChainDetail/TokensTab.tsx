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
import { getTokenBalanceKey } from 'utils/index';

interface Props {
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (tokenSymbol: string, tokenDisplayName: string) => void;
  tokenBalanceKeyPriceMap: Record<string, number>;
}

function getItems(
  selectedNetworkInfo: AccountInfoByNetwork,
  selectedBalanceInfo: BalanceInfo,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  const items: TokenBalanceItemType[] = [];

  const symbol = selectedBalanceInfo?.symbol || 'Unit';
  const networkDisplayName = selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '');
  const isTestnet = selectedNetworkInfo.isTestnet;
  const itemId = getTokenBalanceKey(selectedNetworkInfo.networkKey, symbol, isTestnet);

  items.push({
    id: itemId,
    logoKey: selectedNetworkInfo.networkKey,
    networkKey: selectedNetworkInfo.networkKey,
    networkDisplayName,
    balanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    convertedBalanceValue: selectedBalanceInfo?.convertedBalanceValue || BN_ZERO,
    symbol,
    displayedSymbol: symbol,
    isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
    isTestnet,
    priceValue: tokenBalanceKeyPriceMap[itemId] || 0,
  });

  if (selectedBalanceInfo && selectedBalanceInfo.childrenBalances && selectedBalanceInfo.childrenBalances.length) {
    selectedBalanceInfo.childrenBalances.forEach(item => {
      const cItemId = getTokenBalanceKey(selectedNetworkInfo.networkKey, item.symbol, isTestnet);
      items.push({
        id: cItemId,
        networkKey: selectedNetworkInfo.networkKey,
        networkDisplayName,
        logoKey: item.symbol,
        balanceValue: item.balanceValue,
        convertedBalanceValue: item.convertedBalanceValue,
        symbol: item.symbol,
        displayedSymbol: item.symbol,
        isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
        isTestnet,
        priceValue: tokenBalanceKeyPriceMap[cItemId] || 0,
      });
    });
  }

  return items;
}

export const TokensTab = ({
  selectedNetworkInfo,
  selectedBalanceInfo,
  onPressTokenItem,
  tokenBalanceKeyPriceMap,
}: Props) => {
  const items = getItems(selectedNetworkInfo, selectedBalanceInfo, tokenBalanceKeyPriceMap);
  const [isRefresh, refresh] = useRefresh();
  function renderItem({ item }: ListRenderItemInfo<TokenBalanceItemType>) {
    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.networkKey}`}
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
