import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NominationPoolDataType, PoolTargetData, ValidatorDataType } from 'types/earning';

const useGetPoolTargetList = (slug: string): PoolTargetData[] => {
  const { poolTargetsMap, poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  return useMemo(() => {
    const poolTargets = poolTargetsMap[slug];
    const poolInfo = poolInfoMap[slug];
    if (!poolTargets || !poolInfo) {
      return [];
    }

    const assetInfo = assetRegistry[poolInfo?.metadata.inputAsset];
    const decimals = _getAssetDecimals(assetInfo);
    const symbol = _getAssetSymbol(assetInfo);

    const result: PoolTargetData[] = [];

    for (const poolTarget of poolTargets) {
      if ('id' in poolTarget) {
        const nominationPoolItem: NominationPoolDataType = {
          ...poolTarget,
          decimals,
          symbol,
          idStr: poolTarget.id.toString(),
        };

        result.push(nominationPoolItem);
      } else {
        const validatorItem: ValidatorDataType = {
          ...poolTarget,
          decimals,
          symbol,
        };

        result.push(validatorItem);
      }
    }

    return result;
  }, [assetRegistry, poolInfoMap, poolTargetsMap, slug]);
};

export default useGetPoolTargetList;
