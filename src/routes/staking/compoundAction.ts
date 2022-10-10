import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompoundParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type CompoundStakeActionStackParamList = {
  CompoundConfirm: CompoundParams;
  CompoundAuth: {
    CompoundParams: CompoundParams;
    amount: number;
    feeString: string;
    collator?: string;
    balanceError: boolean;
    CompoundAll: boolean;
  };
  CompoundResult: {
    CompoundParams: CompoundParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<CompoundStakeActionStackParamList>;
export type CompoundActionNavigationProps = NavigationProps['navigation'];

export type CompoundConfirmProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CompoundConfirm'>;
export type CompoundAuthProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CompoundAuth'>;
export type CompoundResultProps = NativeStackScreenProps<CompoundStakeActionStackParamList, 'CompoundResult'>;
