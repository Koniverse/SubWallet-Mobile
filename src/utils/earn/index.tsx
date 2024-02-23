import { YieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';

export const getPoolSlug = (poolInfoMap: Record<string, YieldPoolInfo>, chain: string, type: YieldPoolType) => {
  const selectedPool = Object.values(poolInfoMap).find(item => {
    return item.chain === chain && item.type === type;
  });

  if (selectedPool) {
    return selectedPool.slug;
  }

  return undefined;
};
