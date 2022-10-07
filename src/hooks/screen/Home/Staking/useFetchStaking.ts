import { APIItemState, StakingItem } from '@subwallet/extension-base/background/KoniTypes';
import { StakingDataType, StakingType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchStaking(): StakingType {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const stakingItemMap = useSelector((state: RootState) => state.staking.details);
  const stakingRewardList = useSelector((state: RootState) => state.stakingReward.details);
  const stakeUnlockingInfo = useSelector((state: RootState) => state.stakeUnlockingInfo.details);
  const stakeUnlockingTimestamp = useSelector((state: RootState) => state.stakeUnlockingInfo.timestamp);
  const stakingRewardReady = useSelector((state: RootState) => state.staking.ready);

  const partResult = useMemo((): Omit<StakingType, 'stakeUnlockingTimestamp'> => {
    const parsedPriceMap: Record<string, number> = {};

    const readyStakingItems: StakingItem[] = [];
    const stakingData: StakingDataType[] = [];
    let loading = !stakingRewardReady;

    Object.keys(stakingItemMap).forEach(key => {
      const stakingItem = stakingItemMap[key];

      if (stakingItem.state === APIItemState.READY) {
        loading = false;

        if (stakingItem.balance !== '0' && Math.round(parseFloat(stakingItem.balance as string) * 100) / 100 !== 0) {
          parsedPriceMap[stakingItem.chainId] = priceMap[networkMap[key]?.coinGeckoKey || stakingItem.chainId] || 0;
          readyStakingItems.push(stakingItem);
        }
      }
    });

    for (const stakingItem of readyStakingItems) {
      const stakingDataType: StakingDataType = { staking: stakingItem, key: stakingItem.chainId };

      for (const reward of stakingRewardList) {
        if (stakingItem.chainId === reward.chainId && reward.state === APIItemState.READY) {
          stakingDataType.reward = reward;
        }
      }

      Object.entries(stakeUnlockingInfo).forEach(([key, info]) => {
        if (key === stakingItem.chainId) {
          stakingDataType.staking = {
            ...stakingItem,
            unlockingInfo: info,
          };
        }
      });

      stakingData.push(stakingDataType);
    }

    return {
      loading,
      data: stakingData,
      priceMap: parsedPriceMap,
    };
  }, [networkMap, priceMap, stakeUnlockingInfo, stakingItemMap, stakingRewardList, stakingRewardReady]);

  return useMemo(
    (): StakingType => ({
      ...partResult,
      stakeUnlockingTimestamp,
    }),
    [partResult, stakeUnlockingTimestamp],
  );
}
