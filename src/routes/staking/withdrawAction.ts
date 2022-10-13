import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WithdrawParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type WithdrawStakeActionStackParamList = {
  WithdrawAuth: WithdrawParams;
  WithdrawResult: {
    withdrawParams: WithdrawParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<WithdrawStakeActionStackParamList>;
export type WithdrawActionNavigationProps = NavigationProps['navigation'];

export type WithdrawAuthProps = NativeStackScreenProps<WithdrawStakeActionStackParamList, 'WithdrawAuth'>;
export type WithdrawResultProps = NativeStackScreenProps<WithdrawStakeActionStackParamList, 'WithdrawResult'>;
