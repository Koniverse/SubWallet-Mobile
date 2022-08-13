import { AccountBalanceType } from 'hooks/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceInfo } from '../../types';
import BigN from 'bignumber.js';
import {
  APIItemState,
  BalanceItem,
  ChainRegistry,
  NetworkJson,
  TokenInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO, getTokenDisplayName, parseBalancesInfo } from 'utils/chainBalances';
import { TokenBalanceItemType } from 'types/ui-types';
import { getTokenBalanceKey } from 'utils/index';
import { useMemo } from 'react';

function getMainTokenInfo(chainRegistry: ChainRegistry): TokenInfo {
  // chainRegistryMap always has main token
  return Object.values(chainRegistry.tokenMap).find(t => t.isMainToken) as TokenInfo;
}

function getTokenSymbols(chainRegistry: ChainRegistry): string[] {
  const { tokenMap } = chainRegistry;
  const result: string[] = [];

  chainRegistry.chainTokens.forEach(t => {
    if (!tokenMap[t]) {
      return;
    }

    result.push(tokenMap[t].symbol);
  });

  return result;
}

function getAccountBalance(
  showedNetworks: string[],
  chainRegistryMap: Record<string, ChainRegistry>,
  balanceMap: Record<string, BalanceItem>,
  networkMap: Record<string, NetworkJson>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): AccountBalanceType {
  let totalBalanceValue = new BigN(0);
  const networkBalanceMap: Record<string, BalanceInfo> = {};
  const tokenBalanceMap: Record<string, TokenBalanceItemType> = {};

  showedNetworks.forEach(networkKey => {
    const registry = chainRegistryMap[networkKey];
    const balanceItem = balanceMap[networkKey];
    const networkInfo = networkMap[networkKey];

    if (!(registry && balanceItem && networkInfo)) {
      return;
    }

    const isTestnet = networkInfo.groups.includes('TEST_NET');

    if (balanceItem.state.valueOf() === APIItemState.NOT_SUPPORT.valueOf()) {
      networkBalanceMap[networkKey] = {
        symbol: 'Unit',
        displayedSymbol: 'Unit',
        balanceValue: BN_ZERO,
        convertedBalanceValue: BN_ZERO,
        detailBalances: [],
        childrenBalances: [],
        isReady: true,
      };

      return;
    }

    const mainTokenInfo = getMainTokenInfo(registry);
    let tokenDecimals, tokenSymbols;

    if (['genshiro_testnet', 'genshiro', 'equilibrium_parachain'].includes(networkKey)) {
      tokenDecimals = [mainTokenInfo.decimals];
      tokenSymbols = [getTokenDisplayName(mainTokenInfo.symbol, mainTokenInfo.symbolAlt)];
    } else {
      tokenDecimals = registry.chainDecimals;
      tokenSymbols = getTokenSymbols(registry);
    }

    const balanceInfo = parseBalancesInfo(
      tokenBalanceKeyPriceMap,
      {
        networkKey,
        tokenDecimals,
        tokenSymbols,
        balanceItem,
      },
      registry.tokenMap,
      networkMap[networkKey],
      balanceItem.state.valueOf() === APIItemState.READY.valueOf(),
    );

    networkBalanceMap[networkKey] = balanceInfo;

    const itemId = getTokenBalanceKey(networkKey, balanceInfo.symbol, isTestnet);
    const networkDisplayName = networkMap[networkKey].chain.replace(' Relay Chain', '');

    tokenBalanceMap[itemId] = {
      id: itemId,
      logoKey: networkKey,
      networkKey,
      networkDisplayName,
      balanceValue: balanceInfo.balanceValue,
      convertedBalanceValue: balanceInfo.convertedBalanceValue,
      displayedSymbol: balanceInfo.displayedSymbol,
      symbol: balanceInfo.symbol,
      isReady: balanceInfo.isReady,
      isTestnet,
      priceValue: tokenBalanceKeyPriceMap[itemId] || 0,
    };

    if (balanceInfo.isReady) {
      totalBalanceValue = totalBalanceValue.plus(balanceInfo.convertedBalanceValue);
    }

    if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
      balanceInfo.childrenBalances.forEach(c => {
        if (balanceInfo.isReady) {
          totalBalanceValue = totalBalanceValue.plus(c.convertedBalanceValue);
        }

        const childItemId = getTokenBalanceKey(networkKey, c.symbol, isTestnet);

        tokenBalanceMap[childItemId] = {
          id: childItemId,
          logoKey: c.symbol,
          networkKey,
          networkDisplayName,
          balanceValue: c.balanceValue,
          convertedBalanceValue: c.convertedBalanceValue,
          displayedSymbol: c.displayedSymbol,
          isReady: balanceInfo.isReady,
          symbol: c.symbol,
          isTestnet,
          priceValue: tokenBalanceKeyPriceMap[childItemId] || 0,
        };
      });
    }
  });

  return {
    totalBalanceValue,
    networkBalanceMap,
    tokenBalanceMap,
  };
}

export default function useAccountBalance(
  showedNetworks: string[],
  tokenBalanceKeyPriceMap: Record<string, number>,
): AccountBalanceType {
  const chainRegistryMap = useSelector((state: RootState) => state.chainRegistry);
  const balanceMap = useSelector((state: RootState) => state.balance.details);
  const networkMap = useSelector((state: RootState) => state.networkMap);

  const dep1 = JSON.stringify(balanceMap);
  const dep2 = JSON.stringify(chainRegistryMap);
  const dep3 = JSON.stringify(networkMap);
  const dep4 = JSON.stringify(showedNetworks);
  const dep5 = JSON.stringify(tokenBalanceKeyPriceMap);

  return useMemo<AccountBalanceType>(() => {
    return getAccountBalance(showedNetworks, chainRegistryMap, balanceMap, networkMap, tokenBalanceKeyPriceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, dep3, dep4, dep5]);
}
