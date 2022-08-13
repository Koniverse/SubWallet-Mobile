import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useMemo } from 'react';

function getTokenBalanceKeyPriceMap(
  tokenGroupMap: Record<string, string[]>,
  tokenPriceMap: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};

  Object.keys(tokenGroupMap).forEach(tgKey => {
    const [token, isTestnet] = tgKey.split('|');

    const priceValue = isTestnet ? 0 : tokenPriceMap[token] || 0;

    result[tgKey] = priceValue;

    tokenGroupMap[tgKey].forEach(tbKey => {
      result[tbKey] = priceValue;
    });
  });

  return result;
}

export default function useTokenBalanceKeyPriceMap(tokenGroupMap: Record<string, string[]>): Record<string, number> {
  const tokenPriceMap = useSelector((state: RootState) => state.price.tokenPriceMap);

  const dep1 = JSON.stringify(tokenGroupMap);
  const dep2 = JSON.stringify(tokenPriceMap);

  return useMemo<Record<string, number>>(() => {
    return getTokenBalanceKeyPriceMap(tokenGroupMap, tokenPriceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2]);
}
