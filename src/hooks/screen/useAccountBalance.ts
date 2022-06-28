import { AccountBalanceType } from 'hooks/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceInfo } from '../../types';
import BigN from 'bignumber.js';
import { APIItemState, ChainRegistry, NetWorkGroup, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BN_ZERO, parseBalancesInfo } from 'utils/chainBalances';

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

    result.push(tokenMap[t].symbolAlt || tokenMap[t].symbol);
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
  const networkBalanceMaps: Record<string, BalanceInfo> = {};

  showedNetworks.forEach(networkKey => {
    const registry = chainRegistryMap[networkKey];
    const balanceItem = balanceMap[networkKey];

    if (!registry || !balanceItem) {
      return;
    }

    if (balanceItem.state.valueOf() === APIItemState.NOT_SUPPORT.valueOf()) {
      networkBalanceMaps[networkKey] = {
        symbol: 'Unit',
        balanceValue: BN_ZERO,
        convertedBalanceValue: BN_ZERO,
        detailBalances: [],
        childrenBalances: [],
      };

      return;
    }

    if (balanceItem.state.valueOf() !== APIItemState.READY.valueOf()) {
      return;
    }

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
    );

    networkBalanceMaps[networkKey] = balanceInfo;
    totalBalanceValue = totalBalanceValue.plus(balanceInfo.convertedBalanceValue);

    if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
      balanceInfo.childrenBalances.forEach(c => {
        totalBalanceValue = totalBalanceValue.plus(c.convertedBalanceValue);
      });
    }
  });

  return {
    totalBalanceValue,
    networkBalanceMaps,
  };
}
