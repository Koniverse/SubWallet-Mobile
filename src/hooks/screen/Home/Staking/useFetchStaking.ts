import { APIItemState, StakingItem, StakingRewardItem } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { StakingDataType, StakingType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const groupStakingItems = (stakingItems: StakingItem[]): StakingItem[] => {
  const itemGroups: string[] = [];

  for (const stakingItem of stakingItems) {
    const group = `${stakingItem.chain}-${stakingItem.type}`;

    if (!itemGroups.includes(group)) {
      itemGroups.push(group);
    }
  }

  const groupedStakingItems: StakingItem[] = [];

  for (const group of itemGroups) {
    const [chain, type] = group.split('-');

    const groupedStakingItem: Record<string, any> = {};

    let groupedBalance = 0;
    let groupedActiveBalance = 0;
    let groupedUnlockingBalance = 0;

    for (const stakingItem of stakingItems) {
      if (stakingItem.type === type && stakingItem.chain === chain) {
        groupedStakingItem.name = stakingItem.name;
        groupedStakingItem.chain = stakingItem.chain;
        groupedStakingItem.address = ALL_ACCOUNT_KEY;

        groupedStakingItem.nativeToken = stakingItem.nativeToken;
        groupedStakingItem.unit = stakingItem.unit;

        groupedStakingItem.type = stakingItem.type;
        groupedStakingItem.state = stakingItem.state;

        groupedBalance += parseFloat(stakingItem.balance as string);
        groupedActiveBalance += parseFloat(stakingItem.activeBalance as string);
        groupedUnlockingBalance += parseFloat(stakingItem.unlockingBalance as string);
      }
    }

    groupedStakingItem.balance = groupedBalance.toString();
    groupedStakingItem.activeBalance = groupedActiveBalance.toString();
    groupedStakingItem.unlockingBalance = groupedUnlockingBalance.toString();

    groupedStakingItems.push(groupedStakingItem as StakingItem);
  }

  return groupedStakingItems;
};

const groupStakingRewardItems = (stakingRewardItems: StakingRewardItem[]): StakingRewardItem[] => {
  const itemGroups: string[] = [];

  for (const stakingRewardItem of stakingRewardItems) {
    const group = `${stakingRewardItem.chain}-${stakingRewardItem.type}`;

    if (!itemGroups.includes(group)) {
      itemGroups.push(group);
    }
  }

  const groupedStakingRewardItems: StakingRewardItem[] = [];

  for (const group of itemGroups) {
    const [chain, type] = group.split('-');

    const groupedStakingRewardItem: Record<string, any> = {};

    let groupedLatestReward = 0;
    let groupedTotalReward = 0;
    let groupedTotalSlash = 0;
    let groupedUnclaimedReward = 0;

    for (const stakingRewardItem of stakingRewardItems) {
      if (stakingRewardItem.type === type && stakingRewardItem.chain === chain) {
        groupedStakingRewardItem.state = stakingRewardItem.state;
        groupedStakingRewardItem.name = stakingRewardItem.name;
        groupedStakingRewardItem.chain = stakingRewardItem.chain;
        groupedStakingRewardItem.type = stakingRewardItem.type;
        groupedStakingRewardItem.address = ALL_ACCOUNT_KEY;

        groupedLatestReward += parseFloat(stakingRewardItem.latestReward as string);
        groupedTotalReward += parseFloat(stakingRewardItem.totalReward as string);
        groupedTotalSlash += parseFloat(stakingRewardItem.totalSlash as string);
        groupedUnclaimedReward += parseFloat(stakingRewardItem.unclaimedReward as string);
      }
    }

    groupedStakingRewardItem.latestReward = groupedLatestReward.toString();
    groupedStakingRewardItem.totalReward = groupedTotalReward.toString();
    groupedStakingRewardItem.totalSlash = groupedTotalSlash.toString();
    groupedStakingRewardItem.unclaimedReward = groupedUnclaimedReward.toString();
    groupedStakingRewardItems.push(groupedStakingRewardItem as StakingRewardItem);
  }

  return groupedStakingRewardItems;
};

export default function useFetchStaking(): StakingType {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const stakingItems = useSelector((state: RootState) => state.staking.details);
  const _stakingRewardList = useSelector((state: RootState) => state.stakingReward.details);
  const unlockingItems = useSelector((state: RootState) => state.stakeUnlockingInfo.details);
  const stakeUnlockingTimestamp = useSelector((state: RootState) => state.stakeUnlockingInfo.timestamp);
  const stakingRewardReady = useSelector((state: RootState) => state.staking.ready);
  const currentAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);

  const partResult = useMemo((): Omit<StakingType, 'stakeUnlockingTimestamp'> => {
    const isAccountAll = currentAddress && currentAddress.toLowerCase() === ALL_ACCOUNT_KEY.toLowerCase();
    const parsedPriceMap: Record<string, number> = {};
    let stakingRewardList = _stakingRewardList;
    let readyStakingItems: StakingItem[] = [];
    const stakingData: StakingDataType[] = [];
    let loading = !stakingRewardReady;

    stakingItems.forEach(stakingItem => {
      if (stakingItem.state === APIItemState.READY) {
        loading = false;

        const networkJson = networkMap[stakingItem.chain];

        if (
          stakingItem.balance &&
          parseFloat(stakingItem.balance) > 0 &&
          Math.round(parseFloat(stakingItem.balance) * 100) / 100 !== 0
        ) {
          parsedPriceMap[stakingItem.chain] = priceMap[networkJson?.coinGeckoKey || stakingItem.chain];
          readyStakingItems.push(stakingItem);
        }
      }
    });

    if (isAccountAll) {
      readyStakingItems = groupStakingItems(readyStakingItems);
      stakingRewardList = groupStakingRewardItems(stakingRewardList);
    }

    for (const stakingItem of readyStakingItems) {
      const stakingDataType: StakingDataType = { staking: stakingItem };

      for (const reward of stakingRewardList) {
        if (
          stakingItem.chain === reward.chain &&
          reward.state === APIItemState.READY &&
          stakingItem.type === reward.type &&
          stakingItem.address === reward.address
        ) {
          stakingDataType.reward = reward;
        }
      }

      if (!isAccountAll) {
        unlockingItems.forEach(unlockingInfo => {
          if (
            unlockingInfo.chain === stakingItem.chain &&
            unlockingInfo.type === stakingItem.type &&
            unlockingInfo.address === stakingItem.address
          ) {
            stakingDataType.staking = {
              ...stakingItem,
              unlockingInfo,
            } as StakingItem;
          }
        });
      }

      stakingData.push(stakingDataType);
    }

    return {
      loading,
      data: stakingData,
      priceMap: parsedPriceMap,
    };
  }, [_stakingRewardList, currentAddress, networkMap, priceMap, stakingItems, stakingRewardReady, unlockingItems]);

  return useMemo(
    (): StakingType => ({
      ...partResult,
      stakeUnlockingTimestamp,
    }),
    [partResult, stakeUnlockingTimestamp],
  );
}
