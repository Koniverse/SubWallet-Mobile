import BigN from 'bignumber.js';
import { BalanceInfo } from 'types/index';
import { TokenBalanceItemType } from 'types/ui-types';
import {
  CrowdloanParaState,
  NftCollection,
  NftItem,
  StakingItem,
  StakingRewardItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { BalanceValueType } from 'utils/chainBalances';
import { ConfirmationSlice } from 'stores/types';

export type AccountBalanceType = {
  totalBalanceValue: BigN;
  networkBalanceMap: Record<string, BalanceInfo>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
};

export type CrowdloanContributeValueType = {
  paraState?: CrowdloanParaState;
  contribute: BalanceValueType;
};

export interface NftCollectionType {
  nftCollections: NftCollection[];
}

export interface NftItemType {
  nftItems: NftItem[];
}
export type ConfirmationType = keyof ConfirmationSlice['details'];

export type ConfirmationItem = {
  type: keyof ConfirmationSlice['details'];
  payload: unknown;
};

export type ConfirmationHookType = {
  confirmationRequestMap: ConfirmationSlice['details'];
  cancelRequest: (type: ConfirmationType, id: string) => Promise<void>;
  approveRequest: (
    type: ConfirmationType,
    id: string,
    payload?: { password?: string; data?: unknown },
  ) => Promise<void>;
  rejectRequest: (type: ConfirmationType, id: string) => Promise<void>;
  isEmptyRequests: boolean;
  isDisplayConfirmation: boolean;
  toggleConfirmation: () => void;
  confirmationItems: ConfirmationItem[];
  confirmationItemsLength: number;
};

export type StakingDataType = {
  staking: StakingItem;
  reward?: StakingRewardItem;
};

export type StakingType = {
  loading: boolean;
  data: StakingDataType[];
  priceMap: Record<string, number>;
  stakeUnlockingTimestamp: number; // the timestamp that unlocking data was retrieved
};
