import { AccountBalanceType } from 'hooks/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceInfo } from '../../types';
import BigN from 'bignumber.js';
import { APIItemState, ChainRegistry, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO, parseBalancesInfo } from 'utils/chainBalances';
import { TokenBalanceItemType } from 'types/ui-types';
import { getTokenBalanceKey } from 'utils/index';

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

export default function useAccountBalance(currentNetworkKey: string, showedNetworks: string[]): AccountBalanceType {
  const {
    balance: balanceReducer,
    chainRegistry: chainRegistryMap,
    networkMap,
    price: priceReducer,
  } = useSelector((state: RootState) => state);

  const balanceMap = balanceReducer.details;
  const { priceMap, tokenPriceMap } = priceReducer;

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

    const isTestNet = networkInfo.groups.includes('TEST_NET');

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

    // if (balanceItem.state.valueOf() !== APIItemState.READY.valueOf()) {
    //   return;
    // }

    const mainTokenInfo = getMainTokenInfo(registry);
    let tokenDecimals, tokenSymbols;

    if (['genshiro_testnet', 'genshiro', 'equilibrium_parachain'].includes(networkKey)) {
      tokenDecimals = [mainTokenInfo.decimals];
      tokenSymbols = [mainTokenInfo.symbolAlt || mainTokenInfo.symbol];
    } else {
      tokenDecimals = registry.chainDecimals;
      tokenSymbols = getTokenSymbols(registry);
    }

    const balanceInfo = parseBalancesInfo(
      priceMap,
      tokenPriceMap,
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

    const itemId = getTokenBalanceKey(networkKey, balanceInfo.symbol, isTestNet);
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
    };

    if (balanceInfo.isReady) {
      totalBalanceValue = totalBalanceValue.plus(balanceInfo.convertedBalanceValue);
    }

    if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
      balanceInfo.childrenBalances.forEach(c => {
        if (balanceInfo.isReady) {
          totalBalanceValue = totalBalanceValue.plus(c.convertedBalanceValue);
        }

        const childItemId = getTokenBalanceKey(networkKey, c.symbol, isTestNet);

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
