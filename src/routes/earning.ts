import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeypairType } from '@polkadot/util-crypto/types';

export type EarningScreenStackParamList = {
  EarningList: { step: number; noAccountValid?: boolean; chain?: string; accountType?: KeypairType };
  EarningPoolList: {
    group: string;
    symbol: string;
    isRelatedToRelayChain?: boolean;
  };
  EarningPositionDetail: {
    earningSlug: string;
  };
};

export type NavigationProps = NativeStackScreenProps<EarningScreenStackParamList>;
export type EarningScreenNavigationProps = NavigationProps['navigation'];
// export type StakeScreenNavigationProps = NativeStackScreenProps<EarningScreenStackParamList, 'Stake'>;
// export type UnbondScreenNavigationProps = NativeStackScreenProps<EarningScreenStackParamList, 'Unbond'>;
// export type ClaimRewardScreenNavigationProps = NativeStackScreenProps<EarningScreenStackParamList, 'ClaimReward'>;
// export type WithDrawScreenNavigationProps = NativeStackScreenProps<EarningScreenStackParamList, 'Withdraw'>;
// export type CancelUnstakeScreenNavigationProps = NativeStackScreenProps<EarningScreenStackParamList, 'CancelUnstake'>;
export type EarningListProps = NativeStackScreenProps<EarningScreenStackParamList, 'EarningList'>;
export type EarningPoolListProps = NativeStackScreenProps<EarningScreenStackParamList, 'EarningPoolList'>;
export type EarningPositionDetailProps = NativeStackScreenProps<EarningScreenStackParamList, 'EarningPositionDetail'>;
