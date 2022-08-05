import BigN from 'bignumber.js';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import { BN_ZERO } from 'utils/chainBalances';
import { useMemo } from 'react';
import { BalanceInfo } from '../../../../../types';
import { getTokenBalanceKey, getTotalConvertedBalanceValue } from 'utils/index';

function getTotalBalanceValue(
  viewStep: string,
  currentTgKey: string,
  totalBalanceValue: BigN,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  networkBalanceMap: Record<string, BalanceInfo>,
  selectedTokenSymbol: string,
  selectedNetworkInfo?: AccountInfoByNetwork,
): BigN {
  if (viewStep === ViewStep.TOKEN_GROUPS) {
    return totalBalanceValue;
  }

  if (viewStep === ViewStep.TOKEN_GROUP_DETAIL) {
    if (currentTgKey && tokenGroupMap[currentTgKey]) {
      let result = new BigN(0);

      tokenGroupMap[currentTgKey].forEach(tbKey => {
        if (tokenBalanceMap[tbKey] && tokenBalanceMap[tbKey].isReady) {
          result = result.plus(tokenBalanceMap[tbKey].convertedBalanceValue);
        }
      });

      return result;
    }
  }

  if (viewStep === ViewStep.CHAIN_DETAIL) {
    if (selectedNetworkInfo) {
      return getTotalConvertedBalanceValue(networkBalanceMap[selectedNetworkInfo.networkKey]);
    }
  }

  if (viewStep === ViewStep.TOKEN_HISTORY) {
    if (selectedNetworkInfo && selectedTokenSymbol) {
      const tbKey = getTokenBalanceKey(
        selectedNetworkInfo.networkKey,
        selectedTokenSymbol,
        selectedNetworkInfo.isTestnet,
      );

      if (tokenBalanceMap[tbKey]) {
        return tokenBalanceMap[tbKey].balanceValue;
      }
    }
  }

  return BN_ZERO;
}

export default function useBalanceValue(
  viewStep: string,
  currentTgKey: string,
  totalBalanceValue: BigN,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  networkBalanceMap: Record<string, BalanceInfo>,
  selectedTokenSymbol: string,
  selectedNetworkInfo?: AccountInfoByNetwork,
): BigN {
  const dep1 = totalBalanceValue.toString();
  const dep2 = JSON.stringify(tokenGroupMap);
  const dep3 = JSON.stringify(tokenBalanceMap);
  const dep4 = JSON.stringify(networkBalanceMap);
  const dep5 = selectedNetworkInfo ? JSON.stringify(selectedNetworkInfo) : undefined;

  return useMemo<BigN>(() => {
    return getTotalBalanceValue(
      viewStep,
      currentTgKey,
      totalBalanceValue,
      tokenGroupMap,
      tokenBalanceMap,
      networkBalanceMap,
      selectedTokenSymbol,
      selectedNetworkInfo,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStep, currentTgKey, dep1, dep2, dep3, dep4, dep5, selectedTokenSymbol]);
}
