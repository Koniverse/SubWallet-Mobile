import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StakingScreenStackParamList = {
  StakingBalances: { chain?: string; type?: string };
  Stake: { chain?: string; type?: string };
  Unbond: { chain?: string; type?: string };
  ClaimReward: { chain?: string; type?: string };
  Withdraw: { chain?: string; type?: string };
  CancelUnstake: { chain?: string; type?: string };
};

export type NavigationProps = NativeStackScreenProps<StakingScreenStackParamList>;
export type StakingScreenNavigationProps = NavigationProps['navigation'];
export type StakeScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'Stake'>;
export type UnbondScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'Unbond'>;
export type ClaimRewardScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'ClaimReward'>;
export type WithDrawScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'Withdraw'>;
export type CancelUnstakeScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'CancelUnstake'>;
export type StakingBalancesProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingBalances'>;
