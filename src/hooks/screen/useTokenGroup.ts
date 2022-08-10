import { ChainRegistry, NetworkJson, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getTokenBalanceKey, getTokenGroupKey, tokenNetworkKeyMap } from 'utils/index';
import { useMemo } from 'react';

const KNOW_MAIN_KEYS = [getTokenGroupKey('DOT', true), getTokenGroupKey('KSM', true), getTokenGroupKey('STELLA')];
const KNOW_PREFIXES = ['xcm', 'tai', 'xc', 'lc', 'vs', 'l', 'x', 't', 'h'];

function updateResult(token: string, isTestnet: string, result: Record<string, string[]>, tbKey: string) {
  const mKey = getTokenGroupKey(token, !!isTestnet);

  if (result[mKey]) {
    result[mKey].push(tbKey);
  } else {
    result[mKey] = [tbKey];
  }
}

function resortResult(result: Record<string, string[]>) {
  const tgKeys = Object.keys(result);

  tgKeys.forEach(tgKey => {
    if (tokenNetworkKeyMap[tgKey]) {
      const [tgToken, tgIsTestNet] = tgKey.split('|');
      const prioritizedTbKeys: string[] = [];
      const restTbKeys: string[] = [];

      result[tgKey].forEach(tbKey => {
        const [networkKey] = tbKey.split('|');

        if (tokenNetworkKeyMap[tgKey][0] === networkKey) {
          prioritizedTbKeys.push(tbKey);
        } else {
          restTbKeys.push(tbKey);
        }
      });

      prioritizedTbKeys.sort((a, b) => {
        const [, aToken, aIsTestNet] = a.split('|');
        if (aToken.toLowerCase() === tgToken && aIsTestNet === tgIsTestNet) {
          return -1;
        }

        return a.localeCompare(b);
      });
      restTbKeys.sort();

      result[tgKey] = [...prioritizedTbKeys, ...restTbKeys];
    } else {
      result[tgKey].sort();
    }
  });
}

function isSameGroup(currentToken: string, comparedToken: string, isSameNetworkType: boolean): boolean {
  const possibleTokens = KNOW_PREFIXES.map(p => `${p}${comparedToken}`.toLowerCase());

  return possibleTokens.includes(currentToken.toLowerCase()) && isSameNetworkType;
}

function getFilteredTokenGroupMap(
  showedNetworks: string[],
  tokenGroupMap: Record<string, string[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  Object.keys(tokenGroupMap).forEach(tgKey => {
    const filteredGroupItems = tokenGroupMap[tgKey].filter(tbKey => {
      const [networkKey] = tbKey.split('|');

      return showedNetworks.includes(networkKey);
    });

    if (filteredGroupItems.length) {
      result[tgKey] = filteredGroupItems;
    }
  });

  return result;
}

function getTokenGroup(
  chainRegistryMap: Record<string, ChainRegistry>,
  networkMap: Record<string, NetworkJson>,
  showedNetworks?: string[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const tokenInfoMap: Record<string, TokenInfo> = {};
  const testNetKeys: string[] = [];
  const mainKeys: string[] = [...KNOW_MAIN_KEYS];
  const allocatedKeys: string[] = [];

  Object.keys(networkMap).forEach((networkKey: string) => {
    if (networkMap[networkKey].groups.includes('TEST_NET')) {
      testNetKeys.push(networkKey);
    }

    const nativeToken = networkMap[networkKey].nativeToken;

    if (nativeToken && !['UNIT', 'TOKEN'].includes(nativeToken)) {
      mainKeys.push(getTokenGroupKey(nativeToken, networkMap[networkKey].groups.includes('TEST_NET')));
    }
  });

  Object.keys(chainRegistryMap).forEach(networkKey => {
    const { tokenMap } = chainRegistryMap[networkKey];

    Object.keys(tokenMap).forEach(token => {
      const _key = getTokenGroupKey(token, testNetKeys.includes(networkKey));

      if (tokenMap[token].isMainToken && !mainKeys.includes(_key)) {
        mainKeys.push(_key);
      }

      tokenInfoMap[getTokenBalanceKey(networkKey, token, testNetKeys.includes(networkKey))] = tokenMap[token];
    });
  });

  const tokenInfoMapKeys = Object.keys(tokenInfoMap);

  mainKeys.forEach(k => {
    const [token, isTestnet] = k.split('|');

    tokenInfoMapKeys.forEach(_k => {
      if (allocatedKeys.includes(_k)) {
        return;
      }

      const [, _token, _isTestnet] = _k.split('|');

      if (isSameGroup(_token, token, isTestnet === _isTestnet)) {
        allocatedKeys.push(_k);

        if (!result[k]) {
          result[k] = [];
        }

        result[k].push(_k);
      }
    });
  });

  tokenInfoMapKeys.forEach((k: string) => {
    if (allocatedKeys.includes(k)) {
      return;
    }

    const [, token, isTestnet] = k.split('|');

    if (token.startsWith('xcm')) {
      updateResult(token.substring(3), isTestnet, result, k);
    } else if (token.startsWith('xc')) {
      updateResult(token.substring(2), isTestnet, result, k);
    } else {
      updateResult(token, isTestnet, result, k);
    }

    allocatedKeys.push(k);
  });

  resortResult(result);

  if (!showedNetworks) {
    return result;
  } else {
    return getFilteredTokenGroupMap(showedNetworks, result);
  }
}

export default function useTokenGroup(showedNetworks?: string[]): Record<string, string[]> {
  const { chainRegistry: chainRegistryMap, networkMap } = useSelector((state: RootState) => state);

  const dep1 = JSON.stringify(chainRegistryMap);
  const dep2 = JSON.stringify(networkMap);
  const dep3 = showedNetworks ? JSON.stringify(chainRegistryMap) : undefined;

  return useMemo<Record<string, string[]>>(() => {
    return getTokenGroup(chainRegistryMap, networkMap, showedNetworks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, dep3]);
}
