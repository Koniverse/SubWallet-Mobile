import { TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getTokenBalanceKey, getTokenGroupKey } from 'utils/index';

const KNOW_MAIN_KEYS = [getTokenGroupKey('DOT', true), getTokenGroupKey('KSM', true), getTokenGroupKey('STELLA')];
const KNOW_PREFIXES = ['xcm', 'tai', 'xc', 'lc', 'vs', 'l', 'x', 't', 'h'];

function updateResult(token: string, isTestNet: string, result: Record<string, string[]>, tbKey: string) {
  const mKey = getTokenGroupKey(token, !!isTestNet);

  if (result[mKey]) {
    result[mKey].push(tbKey);
  } else {
    result[mKey] = [tbKey];
  }
}

function isSameGroup(currentToken: string, comparedToken: string, isSameNetworkType: boolean): boolean {
  const possibleTokens = KNOW_PREFIXES.map(p => `${p}${comparedToken}`.toLowerCase());

  return possibleTokens.includes(currentToken.toLowerCase()) && isSameNetworkType;
}

export default function useTokenGroup(): Record<string, string[]> {
  const { chainRegistry: chainRegistryMap, networkMap } = useSelector((state: RootState) => state);
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
    const [token, isTestNet] = k.split('|');

    tokenInfoMapKeys.forEach(_k => {
      if (allocatedKeys.includes(_k)) {
        return;
      }

      const [, _token, _isTestNet] = _k.split('|');

      if (isSameGroup(_token, token, isTestNet === _isTestNet)) {
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

    const [, token, isTestNet] = k.split('|');

    if (token.startsWith('xcm')) {
      updateResult(token.substring(3), isTestNet, result, k);
    } else if (token.startsWith('xc')) {
      updateResult(token.substring(2), isTestNet, result, k);
    } else {
      updateResult(token, isTestNet, result, k);
    }

    allocatedKeys.push(k);
  });

  return result;
}
