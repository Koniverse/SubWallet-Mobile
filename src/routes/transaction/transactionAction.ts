import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TransactionActionStackParamList = {
  SendFund: { slug?: string; recipient?: string };
  SendNFT: {
    chain: string;
    collectionId: string;
    itemId: string;
    owner: string;
  };
  Stake: { chain?: string; type?: string };
  Earning: { slug: string };
  Unbond: { slug: string };
  Withdraw: { slug: string };
  ClaimReward: { slug: string };
  CancelUnstake: { slug: string };
};

export type NavigationProps = NativeStackScreenProps<TransactionActionStackParamList>;
export type TransactionActionNavigationProps = NavigationProps['navigation'];

export type SendFundProps = NativeStackScreenProps<TransactionActionStackParamList, 'SendFund'>;
export type SendNFTProps = NativeStackScreenProps<TransactionActionStackParamList, 'SendNFT'>;
export type StakeProps = NativeStackScreenProps<TransactionActionStackParamList, 'Stake'>;
export type UnbondProps = NativeStackScreenProps<TransactionActionStackParamList, 'Unbond'>;
export type ClaimRewardProps = NativeStackScreenProps<TransactionActionStackParamList, 'ClaimReward'>;
export type WithdrawProps = NativeStackScreenProps<TransactionActionStackParamList, 'Withdraw'>;
export type CancelUnstakeProps = NativeStackScreenProps<TransactionActionStackParamList, 'CancelUnstake'>;
export type EarningProps = NativeStackScreenProps<TransactionActionStackParamList, 'Earning'>;
