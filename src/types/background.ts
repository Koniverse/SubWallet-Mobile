// todo: remove these types below after extension-koni-base export them

export type SubscriptionServiceType = 'chainRegistry' | 'balance' | 'crowdloan' | 'staking';
export type CronServiceType = 'price' | 'nft' | 'staking' | 'history' | 'recoverApi' | 'checkApiStatus';
export type CronType =
  | 'recoverApiMap'
  | 'checkApiMapStatus'
  | 'refreshHistory'
  | 'refreshNft'
  | 'refreshPrice'
  | 'refreshStakeUnlockingInfo'
  | 'refreshStakingReward';

export interface RequestInitCronAndSubscription {
  subscription: {
    activeServices: SubscriptionServiceType[];
  };
  cron: {
    intervalMap: Partial<Record<CronType, number>>;
    activeServices: CronServiceType[];
  };
}

export interface ActiveCronAndSubscriptionMap {
  subscription: Record<SubscriptionServiceType, boolean>;
  cron: Record<CronServiceType, boolean>;
}
