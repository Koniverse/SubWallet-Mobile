import { SiDef } from '@polkadot/util/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompoundParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type CompoundStakeActionStackParamList = {
  CompoundConfirm: CompoundParams;
  CreateCompoundAuth: {
    compoundParams: CompoundParams;
    accountMinimum: string;
    validator: string;
    bondedAmount: string;
    initTime: number;
    balanceError: boolean;
    feeString: string;
    optimalTime: string;
    compoundFee: string;
    si: SiDef;
  };
  CreateCompoundResult: {
    compoundParams: CompoundParams;
    txParams: TransactionResultParams;
  };
  CancelCompoundAuth: {
    compoundParams: CompoundParams;
    taskId: string;
    feeString: string;
    balanceError: boolean;
    validator: string;
  };
  CancelCompoundResult: {
    compoundParams: CompoundParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<CompoundStakeActionStackParamList>;
export type CompoundActionNavigationProps = NavigationProps['navigation'];

export type CompoundConfirmProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CompoundConfirm'>;
export type CreateCompoundAuthProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CreateCompoundAuth'>;
export type CompoundResultProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CreateCompoundResult'>;
export type CancelCompoundAuthProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CancelCompoundAuth'>;
export type CancelCompoundResultProps = NativeStackScreenProps<
  CompoundStakeActionStackParamList,
  'CancelCompoundResult'
>;
