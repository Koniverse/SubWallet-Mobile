import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StakeParams } from 'types/staking';

export type StakeActionStackParamList = {
  StakeConfirm: StakeParams;
  StakeAuth: {
    stakeParams: StakeParams;
    amount: number;
    feeString: string;
  };
  StakeResult: {
    stakeParams: StakeParams;
    txError: string;
    txSuccess: boolean;
    extrinsicHash: string;
  };
};

export type NavigationProps = NativeStackScreenProps<StakeActionStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type StakeConfirmProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeConfirm'>;
export type StakeAuthProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeAuth'>;
export type StakeResultProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeResult'>;
