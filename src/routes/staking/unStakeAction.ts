import { SiDef } from '@polkadot/util/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UnStakeParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type UnStakeActionStackParamList = {
  UnStakeConfirm: UnStakeParams;
  UnStakeAuth: {
    unStakeParams: UnStakeParams;
    amount: number;
    feeString: string;
    validator?: string;
    balanceError: boolean;
    unstakeAll: boolean;
    amountSi: SiDef;
  };
  UnStakeResult: {
    unStakeParams: UnStakeParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<UnStakeActionStackParamList>;
export type UnStakeActionNavigationProps = NavigationProps['navigation'];

export type UnStakeConfirmProps = NativeStackScreenProps<UnStakeActionStackParamList, 'UnStakeConfirm'>;
export type UnStakeAuthProps = NativeStackScreenProps<UnStakeActionStackParamList, 'UnStakeAuth'>;
export type UnStakeResultProps = NativeStackScreenProps<UnStakeActionStackParamList, 'UnStakeResult'>;
