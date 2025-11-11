import { _getMultiChainAsset } from '@subwallet/extension-base/services/chain-service/utils';
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

function getTokenGroup(
  assetRegistryMap: AssetRegistryStore['assetRegistry'],
  filteredChains?: string[],
): TokenGroupHookType {
  const result: TokenGroupHookType = {
    tokenGroupMap: {},
    tokenGroups: [],
    tokenSlugs: [],
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
      result.tokenGroups.push(tokenGroupKey);
    }
  });

  result.tokenGroups.forEach(tokenGroup => {
    result.tokenSlugs.push(...result.tokenGroupMap[tokenGroup]);
  });

  return result;
}

const DEFAULT_RESULT = {
  tokenGroupMap: {},
  tokenGroups: [],
  tokenSlugs: [],
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
