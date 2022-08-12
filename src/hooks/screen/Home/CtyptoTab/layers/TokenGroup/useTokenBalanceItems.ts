import { TokenBalanceItemType } from 'types/ui-types';
import { tokenNetworkKeyMap } from 'utils/index';
import BigN from 'bignumber.js';
import { useMemo } from 'react';
import { getTokenDisplayName } from 'utils/chainBalances';

const prioritizedTokenGroupKeys = ['roc|test', 'wnd|test', 'ksm|test', 'ksm', 'dot|test', 'dot'];

function getGroupListItems(
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  const result: TokenBalanceItemType[] = [];
  const tokenGroupKeys = Object.keys(tokenGroupMap);
  const sortedTokenGroupKeys = tokenGroupKeys.filter(k => !prioritizedTokenGroupKeys.includes(k)).sort();

  prioritizedTokenGroupKeys.forEach(pk => {
    if (tokenGroupKeys.includes(pk)) {
      sortedTokenGroupKeys.unshift(pk);
    }
  });

  sortedTokenGroupKeys.forEach(tgKey => {
    const [symbol, isTestnet] = tgKey.split('|');
    const newItem: TokenBalanceItemType = {
      priceValue: tokenBalanceKeyPriceMap[tgKey] || 0,
      id: tgKey,
      logoKey: tokenNetworkKeyMap[tgKey] ? tokenNetworkKeyMap[tgKey][0] || symbol : symbol,
      networkKey: 'default',
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      networkDisplayName: isTestnet ? 'Testnet' : undefined,
      symbol,
      displayedSymbol: getTokenDisplayName(symbol.toUpperCase()),
      isReady: true,
      isTestnet: !!isTestnet,
    };

    tokenGroupMap[tgKey].forEach(tbKey => {
      const tbItem = tokenBalanceMap[tbKey];
      if (tbItem && tbItem.isReady) {
        newItem.balanceValue = newItem.balanceValue.plus(tbItem.balanceValue);
        newItem.convertedBalanceValue = newItem.convertedBalanceValue.plus(tbItem.convertedBalanceValue);
      }
    });

    result.push(newItem);
  });

  return result;
}

function getGroupDetailItems(
  tbKeys: string[],
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  return tbKeys.map(tbKey => {
    if (tokenBalanceMap[tbKey]) {
      return tokenBalanceMap[tbKey];
    }

    const [networkKey, symbol, isTestnet] = tbKey.split('|');

    return {
      id: tbKey,
      logoKey: symbol,
      networkKey,
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      symbol,
      displayedSymbol: symbol,
      isReady: false,
      isTestnet: !!isTestnet,
      priceValue: tokenBalanceKeyPriceMap[tbKey] || 0,
    };
  });
}

function getTokenBalanceItems(
  isGroupDetail: boolean,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  if (!isGroupDetail) {
    return getGroupListItems(tokenGroupMap, tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  if (currentTgKey && tokenGroupMap[currentTgKey]) {
    return getGroupDetailItems(tokenGroupMap[currentTgKey], tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  return [];
}

export default function useTokenGroup(
  isGroupDetail: boolean,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  const dep1 = JSON.stringify(tokenBalanceKeyPriceMap);
  const dep2 = JSON.stringify(tokenBalanceMap);
  const dep3 = JSON.stringify(tokenGroupMap);

  return useMemo<TokenBalanceItemType[]>(() => {
    return getTokenBalanceItems(isGroupDetail, currentTgKey, tokenGroupMap, tokenBalanceMap, tokenBalanceKeyPriceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTgKey, isGroupDetail, dep1, dep2, dep3]);
}
