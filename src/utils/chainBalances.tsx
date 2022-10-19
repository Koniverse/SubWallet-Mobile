import { AccountInfoItem, BalanceInfo, BalanceSubInfo } from 'types/index';
import { NetworkJson, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { getTokenBalanceKey, isEmptyArray } from 'utils/index';

export const BN_TEN = new BigN(10);
export const BN_ZERO = new BigN(0);

type BalanceType = {
  balance: string;
  price?: number;
  decimals: number;
  symbol: string;
};

type BalanceWithDecimalsProps = {
  balance: string;
  decimals: number;
};

// all keys must be lowercase
export const tokenDisplayNameMap: Record<string, string> = {
  ausd: 'aUSD',
};

export function getTokenDisplayName(symbol: string, symbolAlt?: string): string {
  return symbolAlt || tokenDisplayNameMap[symbol.toLowerCase()] || symbol;
}

const getBalanceWithDecimals = ({ balance, decimals }: BalanceWithDecimalsProps) => {
  return new BigN(balance).div(BN_TEN.pow(decimals));
};

export const getConvertedBalance = (balance: BigN, price: string) => {
  return balance && price ? balance.multipliedBy(new BigN(price)) : BN_ZERO;
};

export type BalanceValueType = {
  balanceValue: BigN;
  convertedBalanceValue: BigN;
  symbol: string;
};

export const getBalances = ({ balance, decimals, price, symbol }: BalanceType): BalanceValueType => {
  const stable = price !== undefined ? price : symbol.toLowerCase().includes('usd') ? 1 : 0;

  const balanceValue = getBalanceWithDecimals({ balance, decimals });

  const priceValue = price || stable;

  const convertedBalanceValue = getConvertedBalance(balanceValue, `${priceValue}`);

  return {
    balanceValue,
    convertedBalanceValue,
    symbol,
  };
};

// function getTokenPrice(tokenPriceMap: Record<string, number>, token: string): number {
//   if (token === 'LCDOT') {
//     return (tokenPriceMap.dot || 0) * 0.6925;
//   }
//
//   return tokenPriceMap[token.toLowerCase()] || 0;
// }

export const parseBalancesInfo = (
  tokenBalanceKeyPriceMap: Record<string, number>,
  balanceInfo: AccountInfoItem,
  tokenMap: Record<string, TokenInfo>,
  networkJson: NetworkJson,
  isReady: boolean,
): BalanceInfo => {
  const { balanceItem, networkKey, tokenDecimals, tokenSymbols } = balanceInfo;
  const decimals = tokenDecimals && !isEmptyArray(tokenDecimals) ? tokenDecimals[0] : 0;
  const symbol = tokenSymbols && !isEmptyArray(tokenSymbols) ? tokenSymbols[0] : '';
  const displayedSymbol = getTokenDisplayName(symbol, tokenMap[symbol]?.symbolAlt);
  const isTestnet = networkJson.groups.includes('TEST_NET');
  const tbKey = getTokenBalanceKey(networkKey, symbol, isTestnet);

  const {
    children: balanceChildren,
    feeFrozen: frozenFee,
    free: freeBalance,
    miscFrozen: frozenMisc,
    reserved: reservedBalance,
  } = balanceItem;
  const transferableBalance = new BigN(freeBalance || '0').minus(new BigN(frozenMisc || '0')).toString();

  const accountData = [
    { key: 'free', label: 'Transferable', value: transferableBalance || '0' },
    { key: 'reserved', label: 'Reserved balance', value: reservedBalance || '0' },
    { key: 'locked', label: 'Locked balance', value: frozenMisc || '0' },
    { key: 'frozen', label: 'Frozen fee', value: frozenFee || '0' },
  ];

  const detailBalances: BalanceSubInfo[] = [];

  let totalBalanceValue = BN_ZERO;
  let totalConvertedBalanceValue = BN_ZERO;

  accountData.forEach(({ key, label, value }) => {
    const { balanceValue, convertedBalanceValue } = getBalances({
      balance: value,
      decimals,
      symbol,
      price: tokenBalanceKeyPriceMap[tbKey] || 0,
    });

    if (['free', 'reserved', 'locked'].includes(key)) {
      totalBalanceValue = totalBalanceValue.plus(balanceValue);
      totalConvertedBalanceValue = totalConvertedBalanceValue.plus(convertedBalanceValue);
    }

    detailBalances.push({
      key,
      label,
      symbol,
      displayedSymbol,
      convertedBalanceValue,
      balanceValue,
    });
  });

  const childrenBalances: BalanceSubInfo[] = [];

  if (balanceChildren) {
    Object.keys(balanceChildren).forEach(token => {
      const item = balanceChildren[token];
      const childTbKey = getTokenBalanceKey(networkKey, token, isTestnet);

      const { balanceValue, convertedBalanceValue } = getBalances({
        balance: item.free,
        decimals: item.decimals,
        symbol: token,
        price: tokenBalanceKeyPriceMap[childTbKey] || 0,
      });

      childrenBalances.push({
        key: token,
        label: '',
        symbol: token,
        displayedSymbol: getTokenDisplayName(token, tokenMap[token]?.symbolAlt),
        convertedBalanceValue,
        balanceValue,
      });
    });
  }

  return {
    symbol,
    displayedSymbol,
    balanceValue: totalBalanceValue,
    convertedBalanceValue: totalConvertedBalanceValue,
    detailBalances,
    childrenBalances,
    isReady,
  };
};

const formatLocaleNumber = (number: number): string => {
  return number.toLocaleString('en-UK', { maximumFractionDigits: 4 });
};

export const parseBalanceString = (balance: number, unit: string) => {
  const milThreshold = 1000000;

  if (balance > milThreshold) {
    return formatLocaleNumber(Math.round((balance / milThreshold) * 100) / 100) + ' ' + `M${unit}`;
  } else {
    return formatLocaleNumber(Math.round(balance * 100) / 100) + ' ' + unit;
  }
};
