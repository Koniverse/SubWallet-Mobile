import { _getMultiChainAsset, _isNativeTokenBySlug } from '@subwallet/extension-base/services/chain-service/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isTokenAvailable } from 'utils/chainAndAsset';
import { TokenGroupHookType } from 'types/hook';
import { AssetRegistryStore } from 'stores/types';
import useChainAssets from 'hooks/chain/useChainAssets';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { useIsMantaPayEnabled } from 'hooks/account/useIsMantaPayEnabled';

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
  filteredChains?: string[],
): TokenGroupHookType {
  const result: TokenGroupHookType = {
    tokenGroupMap: {},
    sortedTokenGroups: [],
    sortedTokenSlugs: [],
  };

  Object.values(assetRegistryMap).forEach(chainAsset => {
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
  const assetRegistryMap = useChainAssets().chainAssetRegistry;
  const assetSettingMap = useSelector((state: RootState) => state.assetRegistry.assetSettingMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);
  const isMantaEnabled = useIsMantaPayEnabled();
  const excludedAssets = useMemo(() => {
    const _excludedAssets: string[] = [];

    // exclude zkAssets if not enabled
    if (!isMantaEnabled) {
      Object.values(assetRegistryMap).forEach(chainAsset => {
        if (_MANTA_ZK_CHAIN_GROUP.includes(chainAsset.originChain) && chainAsset.symbol.startsWith(_ZK_ASSET_PREFIX)) {
          excludedAssets.push(chainAsset.slug);
        }
      });
    }

    return _excludedAssets;
  }, [assetRegistryMap, isMantaEnabled]);

  const filteredAssetRegistryMap = useMemo(() => {
    const _filteredAssetRegistryMap: Record<string, _ChainAsset> = {};

    Object.values(assetRegistryMap).forEach(chainAsset => {
      if (
        isTokenAvailable(chainAsset, assetSettingMap, chainStateMap, true) &&
        !excludedAssets.includes(chainAsset.slug)
      ) {
        _filteredAssetRegistryMap[chainAsset.slug] = chainAsset;
      }
    });

    return _filteredAssetRegistryMap;
  }, [assetRegistryMap, assetSettingMap, chainStateMap, excludedAssets]);
  const [result, setResult] = useState<TokenGroupHookType>(
    lazy ? DEFAULT_RESULT : getTokenGroup(filteredAssetRegistryMap, filteredChains),
  );

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setResult(getTokenGroup(filteredAssetRegistryMap, filteredChains));
    });
    return () => clearTimeout(timeoutID);
  }, [filteredAssetRegistryMap, filteredChains]);

  return result;
}
