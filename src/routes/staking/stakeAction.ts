import { SiDef } from '@polkadot/util/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StakeParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type StakeActionStackParamList = {
  StakeConfirm: StakeParams;
  StakeAuth: {
    stakeParams: StakeParams;
    amount: number;
    feeString: string;
    amountSi: SiDef;
  };
  StakeResult: {
    stakeParams: StakeParams;
    txParams: TransactionResultParams;
  };
  StakeValidatorDetail: StakeParams;
};

export type NavigationProps = NativeStackScreenProps<StakeActionStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type StakeConfirmProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeConfirm'>;
export type StakeAuthProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeAuth'>;
export type StakeResultProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeResult'>;
export type StakeValidatorDetailProps = NativeStackScreenProps<StakeActionStackParamList, 'StakeValidatorDetail'>;
