import { _getMultiChainAsset, _isNativeTokenBySlug } from '@subwallet/extension-base/services/chain-service/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isTokenAvailable } from 'utils/chainAndAsset';
import { TokenGroupHookType } from 'types/hook';
import { AssetRegistryStore, ChainStore } from 'stores/types';

function sortTokenSlugs(tokenSlugs: string[]) {
  tokenSlugs.sort((a, b) => {
    const hasNativeA = _isNativeTokenBySlug(a);
    const hasNativeB = _isNativeTokenBySlug(b);

    if (hasNativeA && !hasNativeB) {
      return -1; // if only element a has "NATIVE", a comes before b
    } else if (!hasNativeA && hasNativeB) {
      return 1; // if only element b has "NATIVE", a comes after b
    } else {
      return a.localeCompare(b); // if both elements have "native" or neither does, sort alphabetically
    }
  });
}

function sortTokenGroupMap(tokenGroupMap: TokenGroupHookType['tokenGroupMap']) {
  Object.keys(tokenGroupMap).forEach(tokenGroup => {
    sortTokenSlugs(tokenGroupMap[tokenGroup]);
  });
}

const prioritizedTokenGroups = ['DOT-Polkadot', 'KSM-Kusama'];

function sortTokenGroups(tokenGroups: string[]) {
  tokenGroups.sort((a, b) => {
    const indexA = prioritizedTokenGroups.indexOf(a);
    const indexB = prioritizedTokenGroups.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b); // if both elements are not in the prioritizedTokenGroups array, sort alphabetically
    } else if (indexA === -1) {
      return 1; // if only element b is in the prioritizedTokenGroups array, a comes after b
    } else if (indexB === -1) {
      return -1; // if only element a is in the prioritizedTokenGroups array, a comes before b
    } else {
      return indexA - indexB; // if both elements are in the prioritizedTokenGroups array, sort by their position in the array
    }
  });
}

function getTokenGroup(
  assetRegistryMap: AssetRegistryStore['assetRegistry'],
  assetSettingMap: AssetRegistryStore['assetSettingMap'],
  chainStateMap: ChainStore['chainStateMap'],
  filteredChains?: string[],
): TokenGroupHookType {
  const result: TokenGroupHookType = {
    tokenGroupMap: {},
    sortedTokenGroups: [],
    sortedTokenSlugs: [],
  };

  Object.values(assetRegistryMap).forEach(chainAsset => {
    if (!isTokenAvailable(chainAsset, assetSettingMap, chainStateMap, true)) {
      return;
    }

    const chain = chainAsset.originChain;

    if (filteredChains && !filteredChains.includes(chain)) {
      return;
    }

    const multiChainAsset = _getMultiChainAsset(chainAsset);
    const tokenGroupKey = multiChainAsset || chainAsset.slug;

    if (result.tokenGroupMap[tokenGroupKey]) {
      result.tokenGroupMap[tokenGroupKey].push(chainAsset.slug);
    } else {
      result.tokenGroupMap[tokenGroupKey] = [chainAsset.slug];
      result.sortedTokenGroups.push(tokenGroupKey);
    }
  });

  sortTokenGroupMap(result.tokenGroupMap);
  sortTokenGroups(result.sortedTokenGroups);

  result.sortedTokenGroups.forEach(tokenGroup => {
    result.sortedTokenSlugs.push(...result.tokenGroupMap[tokenGroup]);
  });

  return result;
}

const DEFAULT_RESULT = {
  tokenGroupMap: {},
  sortedTokenGroups: [],
  sortedTokenSlugs: [],
  isComputing: true,
} as TokenGroupHookType;

export default function useTokenGroup(filteredChains?: string[], lazy?: boolean): TokenGroupHookType {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const assetSettingMap = useSelector((state: RootState) => state.assetRegistry.assetSettingMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);
  const [result, setResult] = useState<TokenGroupHookType>(
    lazy ? DEFAULT_RESULT : getTokenGroup(assetRegistryMap, assetSettingMap, chainStateMap, filteredChains),
  );

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setResult(getTokenGroup(assetRegistryMap, assetSettingMap, chainStateMap, filteredChains));
    });
    return () => clearTimeout(timeoutID);
  }, [assetRegistryMap, assetSettingMap, chainStateMap, filteredChains]);

  return result;
}
