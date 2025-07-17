import { _ChainAsset } from '@subwallet/chain-list/types';
import { APIItemState, CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetPriceId,
  _getAssetSymbol,
  _getChainName,
  _isAssetValuable,
} from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { TokenBalanceItemType } from 'types/balance';
import { AssetRegistryStore, BalanceStore, ChainStore, PriceStore } from 'stores/types';
import { RootState } from 'stores/index';

// todo: find a way to merge identical logic from useAccountBalance

interface TokenItem {
  slug: string;
}

const defaultCurrency = { label: 'United States Dollar', symbol: '$', isPrefix: true };

function getBalanceValue(balance: string, decimals: number): BigN {
  return new BigN(balance).div(new BigN(10).pow(decimals));
}

function getConvertedBalanceValue(balance: BigN, price: number): BigN {
  return balance ? balance.multipliedBy(new BigN(price)) : new BigN(0);
}

function getDefaultBalanceItem(
  slug: string,
  symbol: string,
  logoKey: string,
  currency?: CurrencyJson,
): TokenBalanceItemType {
  return {
    free: {
      value: new BigN(0),
      convertedValue: new BigN(0),
      pastConvertedValue: new BigN(0),
    },
    locked: {
      value: new BigN(0),
      convertedValue: new BigN(0),
      pastConvertedValue: new BigN(0),
    },
    total: {
      value: new BigN(0),
      convertedValue: new BigN(0),
      pastConvertedValue: new BigN(0),
    },
    isReady: false,
    isTestnet: false,
    isNotSupport: true,
    price24hValue: 0,
    priceValue: 0,
    logoKey,
    slug,
    currency: currency || defaultCurrency,
    symbol,
  };
}

function getDefaultTokenBalance(
  tokenSlug: string,
  chainAsset: _ChainAsset,
  currency?: CurrencyJson,
): TokenBalanceItemType {
  const symbol = _getAssetSymbol(chainAsset);

  return getDefaultBalanceItem(tokenSlug, symbol, chainAsset.slug.toLowerCase(), currency);
}

function getTokenBalanceMap(
  accountProxyId: string,
  tokenItems: TokenItem[] | string[],
  balanceMap: BalanceStore['balanceMap'],
  priceMap: PriceStore['priceMap'],
  price24hMap: PriceStore['price24hMap'],
  assetRegistryMap: AssetRegistryStore['assetRegistry'],
  chainInfoMap: ChainStore['chainInfoMap'],
  currency?: CurrencyJson,
): Record<string, TokenBalanceItemType | undefined> {
  if (!accountProxyId || !balanceMap[accountProxyId]) {
    return {};
  }

  const result: Record<string, TokenBalanceItemType | undefined> = {};

  tokenItems.forEach(ti => {
    const tokenSlug = typeof ti === 'string' ? ti : ti.slug;

    const chainAsset = assetRegistryMap[tokenSlug];

    if (!chainAsset) {
      return;
    }

    const tokenBalance = getDefaultTokenBalance(tokenSlug, chainAsset, currency);

    tokenBalance.currency = currency;
    const originChain = _getAssetOriginChain(chainAsset);
    const balanceItem = balanceMap[accountProxyId]?.[tokenSlug];
    const decimals = _getAssetDecimals(chainAsset);

    const isTokenBalanceReady = !!balanceItem && balanceItem.state !== APIItemState.PENDING;
    const isTokenNotSupport = !!balanceItem && balanceItem.state === APIItemState.NOT_SUPPORT;

    tokenBalance.isReady = isTokenBalanceReady;
    tokenBalance.isNotSupport = isTokenNotSupport;
    tokenBalance.chain = originChain;
    tokenBalance.chainDisplayName = _getChainName(chainInfoMap[originChain]);
    tokenBalance.isTestnet = !_isAssetValuable(chainAsset);

    if (isTokenBalanceReady) {
      tokenBalance.free.value = tokenBalance.free.value.plus(getBalanceValue(balanceItem.free || '0', decimals));
      tokenBalance.locked.value = tokenBalance.locked.value.plus(getBalanceValue(balanceItem.locked || '0', decimals));
      tokenBalance.total.value = tokenBalance.free.value.plus(tokenBalance.locked.value);
    }

    const priceId = _getAssetPriceId(chainAsset);

    // convert token value to real life currency value
    if (priceId && !tokenBalance.isTestnet) {
      const priceValue = priceMap[priceId] || 0;
      const price24hValue = price24hMap[priceId] || 0;

      tokenBalance.priceValue = priceValue;
      tokenBalance.price24hValue = price24hValue;

      if (priceValue > price24hValue) {
        tokenBalance.priceChangeStatus = 'increase';
      } else if (priceValue < price24hValue) {
        tokenBalance.priceChangeStatus = 'decrease';
      }

      if (isTokenBalanceReady) {
        tokenBalance.free.convertedValue = tokenBalance.free.convertedValue.plus(
          getConvertedBalanceValue(tokenBalance.free.value, priceValue),
        );
        tokenBalance.free.pastConvertedValue = tokenBalance.free.pastConvertedValue.plus(
          getConvertedBalanceValue(tokenBalance.free.value, price24hValue),
        );

        tokenBalance.locked.convertedValue = tokenBalance.locked.convertedValue.plus(
          getConvertedBalanceValue(tokenBalance.locked.value, priceValue),
        );
        tokenBalance.locked.pastConvertedValue = tokenBalance.locked.pastConvertedValue.plus(
          getConvertedBalanceValue(tokenBalance.locked.value, price24hValue),
        );

        tokenBalance.total.convertedValue = tokenBalance.total.convertedValue.plus(
          getConvertedBalanceValue(tokenBalance.total.value, priceValue),
        );

        tokenBalance.total.pastConvertedValue = tokenBalance.total.pastConvertedValue.plus(
          getConvertedBalanceValue(tokenBalance.total.value, price24hValue),
        );
      }
    }

    result[tokenSlug] = tokenBalance;
  });

  return result;
}

const useGetAccountTokenBalance = () => {
  const balanceMap = useSelector((state: RootState) => state.balance.balanceMap);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const price24hMap = useSelector((state: RootState) => state.price.price24hMap);
  const currency = useSelector((state: RootState) => state.price.currencyData);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  // note: string in Record<string, TokenBalanceItemType | undefined> is token slug
  return useCallback(
    (tokenItems: TokenItem[] | string[], accountProxyId: string): Record<string, TokenBalanceItemType | undefined> => {
      return getTokenBalanceMap(
        accountProxyId,
        tokenItems,
        balanceMap,
        priceMap,
        price24hMap,
        assetRegistryMap,
        chainInfoMap,
        currency,
      );
    },
    [assetRegistryMap, balanceMap, chainInfoMap, currency, price24hMap, priceMap],
  );
};

export default useGetAccountTokenBalance;
