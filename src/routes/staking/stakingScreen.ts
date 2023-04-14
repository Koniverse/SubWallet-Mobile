import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StakingType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { NetworkValidatorsInfo } from 'types/staking';

export type StakingScreenStackParamList = {
  StakingBalances: undefined;
  StakingBalanceDetail: {
    networkKey: string;
    stakingType: StakingType;
  };
  StakingNetworks: undefined;
  StakingValidators: {
    networkKey: string;
  };
  StakingValidatorDetail: {
    networkKey: string;
    validatorInfo: ValidatorInfo;
    networkValidatorsInfo: NetworkValidatorsInfo;
  };
  Stake: { chain?: string; type?: string };
  Unbond: { chain?: string; type?: string };
};

export type NavigationProps = NativeStackScreenProps<StakingScreenStackParamList>;
export type StakingScreenNavigationProps = NavigationProps['navigation'];
export type StakeScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'Stake'>;
export type UnbondScreenNavigationProps = NativeStackScreenProps<StakingScreenStackParamList, 'Unbond'>;
export type StakingBalancesProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingBalances'>;
export type StakingBalanceDetailProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingBalanceDetail'>;
export type StakingNetworksProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingNetworks'>;
export type StakingValidatorsProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingValidators'>;
export type StakingValidatorDetailProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingValidatorDetail'>;
