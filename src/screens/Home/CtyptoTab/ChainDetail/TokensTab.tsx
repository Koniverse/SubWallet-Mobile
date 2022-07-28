import React from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import * as Tabs from 'react-native-collapsible-tab-view';
import {ColorMap} from "styles/color";

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
    <Tabs.FlatList nestedScrollEnabled style={{ paddingTop: 8, backgroundColor: ColorMap.dark1 }} keyboardShouldPersistTaps={'handled'} data={items} renderItem={renderItem} />
  );
};
