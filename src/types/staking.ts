import { StakingType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';

export interface NetworkValidatorsInfo {
  maxNominatorPerValidator: number;
  isBondedBefore: boolean;
  bondedValidators: string[];
  maxNominations: number;
}

export type ValidatorSortBy = 'Default' | 'Commission' | 'Return';
export type ValidatorType = 'Validator' | 'Collator' | 'DApp' | 'Unknown';

export interface StakeParams {
  networkKey: string;
  selectedAccount: string;
  validator: ValidatorInfo;
  networkValidatorsInfo: NetworkValidatorsInfo;
}

export interface UnStakeParams {
  networkKey: string;
  selectedAccount: string;
  bondedAmount: number;
}

export interface WithdrawParams {
  networkKey: string;
  selectedAccount: string;
  withdrawAmount: number;
  nextWithdrawalAction?: string;
  targetValidator?: string;
}

export interface ClaimParams {
  networkKey: string;
  selectedAccount: string;
  stakingType: StakingType;
}

export interface CompoundParams {
  networkKey: string;
  selectedAccount: string;
}
