import { BN_ZERO } from '@polkadot/util';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceValueInfo } from 'types/balance';
import { YieldGroupInfo } from 'types/earning';
import { _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { YieldPoolInfo } from '@subwallet/extension-base/types';

const useYieldGroupInfo = (): YieldGroupInfo[] => {
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry, multiChainAssetMap } = useSelector((state: RootState) => state.assetRegistry);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const chainsByAccountType = useGetChainSlugs();
  const { tokenGroupMap } = useTokenGroup(chainsByAccountType);
  const { tokenGroupBalanceMap, tokenBalanceMap } = useAccountBalance(tokenGroupMap, undefined, true);

  const poolInfoMapRef = useRef<Record<string, YieldPoolInfo>>(poolInfoMap);
  const assetRegistryRef = useRef<Record<string, _ChainAsset>>(assetRegistry);
  const multiChainAssetMapRef = useRef<Record<string, _MultiChainAsset>>(multiChainAssetMap);
  const chainInfoMapRef = useRef<Record<string, _ChainInfo>>(chainInfoMap);

  useEffect(() => {
    poolInfoMapRef.current = poolInfoMap;
    assetRegistryRef.current = assetRegistry;
    multiChainAssetMapRef.current = multiChainAssetMap;
    chainInfoMapRef.current = chainInfoMap;
  }, [assetRegistry, chainInfoMap, multiChainAssetMap, poolInfoMap]);

  return useMemo(() => {
    const result: Record<string, YieldGroupInfo> = {};

    for (const pool of Object.values(poolInfoMapRef.current)) {
      const chain = pool.chain;
      if (chainsByAccountType.includes(chain)) {
        const group = pool.group;
        const exists = result[group];
        const chainInfo = chainInfoMapRef.current[chain];

        if (exists) {
          let apy: undefined | number;
          exists.poolListLength = exists.poolListLength + 1;
          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          if (apy !== undefined) {
            exists.maxApy = Math.max(exists.maxApy || 0, apy);
          }
          exists.isTestnet = exists.isTestnet || chainInfo.isTestnet;
        } else {
          const token = multiChainAssetMapRef.current[group] || assetRegistryRef.current[group];
          const balance = tokenGroupBalanceMap[group] || tokenBalanceMap[group];
          const freeBalance: BalanceValueInfo = balance?.free || {
            value: BN_ZERO,
            convertedValue: BN_ZERO,
            pastConvertedValue: BN_ZERO,
          };

          let apy: undefined | number;
          if (pool.statistic?.totalApy) {
            apy = pool.statistic?.totalApy;
          }

          if (pool.statistic?.totalApr) {
            apy = calculateReward(pool.statistic?.totalApr).apy;
          }

          result[group] = {
            group: group,
            token: token.slug,
            maxApy: apy,
            symbol: token.symbol,
            balance: freeBalance,
            isTestnet: chainInfo.isTestnet,
            name: token.name,
            chain: chain,
            poolListLength: 1,
          };
        }
      }
    }

    return Object.values(result);
  }, [chainsByAccountType, tokenBalanceMap, tokenGroupBalanceMap]);
};

export default useYieldGroupInfo;
