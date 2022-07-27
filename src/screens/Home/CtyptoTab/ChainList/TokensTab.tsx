import React from 'react';
import { ScrollView } from 'react-native';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { getTokenBalanceItems } from 'utils/index';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';

interface Props {
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressTokenItem: (tokenName: string, tokenSymbol: string, info?: AccountInfoByNetwork) => void;
}

export const TokensTab = ({ networkBalanceMaps, onPressTokenItem, accountInfoByNetworkMap }: Props) => {
  const tokenBalanceItems = getTokenBalanceItems(networkBalanceMaps);

  const renderItem = (item: TokenBalanceItemType) => {
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

  return <ScrollView style={{ paddingTop: 8 }}>{tokenBalanceItems && tokenBalanceItems.map(renderItem)}</ScrollView>;
};
