import { useMemo } from 'react';
import BigN from 'bignumber.js';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { getTokenBalanceKey } from 'utils/index';

function getConvertedBalanceValue(
  selectedNetworkInfo: AccountInfoByNetwork | undefined,
  selectedTokenSymbol: string | undefined,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): BigN {
  if (selectedNetworkInfo && selectedTokenSymbol) {
    const tbKey = getTokenBalanceKey(
      selectedNetworkInfo.networkKey,
      selectedTokenSymbol,
      selectedNetworkInfo.isTestnet,
    );

    if (tokenBalanceMap[tbKey]) {
      return tokenBalanceMap[tbKey].convertedBalanceValue;
    }
  }

  return new BigN(0);
}

export default function useConvertedBalanceValue(
  selectedNetworkInfo: AccountInfoByNetwork | undefined,
  selectedTokenSymbol: string | undefined,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): BigN {
  const dep1 = selectedNetworkInfo ? JSON.stringify(selectedNetworkInfo) : undefined;
  const dep2 = JSON.stringify(tokenBalanceMap);

  return useMemo<BigN>(() => {
    return getConvertedBalanceValue(selectedNetworkInfo, selectedTokenSymbol, tokenBalanceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, selectedTokenSymbol, dep2]);
}
