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
};

export type NavigationProps = NativeStackScreenProps<StakingScreenStackParamList>;
export type StakingScreenNavigationProps = NavigationProps['navigation'];

export type StakingBalancesProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingBalances'>;
export type StakingBalanceDetailProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingBalanceDetail'>;
export type StakingNetworksProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingNetworks'>;
export type StakingValidatorsProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingValidators'>;
export type StakingValidatorDetailProps = NativeStackScreenProps<StakingScreenStackParamList, 'StakingValidatorDetail'>;
