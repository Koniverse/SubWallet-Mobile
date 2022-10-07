import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClaimParams } from 'types/staking';
import { TransactionResultParams } from 'types/tx';

export type ClaimStakeActionStackParamList = {
  ClaimAuth: ClaimParams;
  ClaimResult: {
    claimParams: ClaimParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<ClaimStakeActionStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type ClaimAuthProps = NativeStackScreenProps<ClaimStakeActionStackParamList, 'ClaimAuth'>;
export type ClaimResultProps = NativeStackScreenProps<ClaimStakeActionStackParamList, 'ClaimResult'>;
