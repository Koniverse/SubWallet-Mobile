import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NominationInfo, YieldPositionInfo } from '@subwallet/extension-base/types';

export type TransactionActionStackParamList = {
  SendFund: { slug?: string; recipient?: string };
  SendNFT: {
    from: string;
    chain: string;
    collectionId: string;
    itemId: string;
  };
  Stake: { chain?: string; type?: string };
  Earning: { slug: string; target?: string; redirectFromPreview?: boolean };
  Swap: { slug?: string };
  Unbond: { slug: string };
  Withdraw: { slug: string; chain: string; from: string };
  ClaimReward: { slug: string; chain: string; from: string };
  ClaimBridge: { asset: string; chain: string; notificationId: string; from: string };
  CancelUnstake: { slug: string; chain: string; from: string };
  ChangeEarningValidator: {
    slug: string;
    chain: string;
    from: string;
    displayType: 'validator' | 'nomination';
    compound: YieldPositionInfo;
    nominations: NominationInfo[];
    readOnly?: boolean;
    addresses?: string[];
  };
};

export type NavigationProps = NativeStackScreenProps<TransactionActionStackParamList>;
export type TransactionActionNavigationProps = NavigationProps['navigation'];

export type SendFundProps = NativeStackScreenProps<TransactionActionStackParamList, 'SendFund'>;
export type SendNFTProps = NativeStackScreenProps<TransactionActionStackParamList, 'SendNFT'>;
export type StakeProps = NativeStackScreenProps<TransactionActionStackParamList, 'Stake'>;
export type UnbondProps = NativeStackScreenProps<TransactionActionStackParamList, 'Unbond'>;
export type ClaimRewardProps = NativeStackScreenProps<TransactionActionStackParamList, 'ClaimReward'>;
export type ClaimBridgeProps = NativeStackScreenProps<TransactionActionStackParamList, 'ClaimBridge'>;
export type WithdrawProps = NativeStackScreenProps<TransactionActionStackParamList, 'Withdraw'>;
export type CancelUnstakeProps = NativeStackScreenProps<TransactionActionStackParamList, 'CancelUnstake'>;
export type EarningProps = NativeStackScreenProps<TransactionActionStackParamList, 'Earning'>;
export type SwapProps = NativeStackScreenProps<TransactionActionStackParamList, 'Swap'>;
export type ChangeEarningValidatorProps = NativeStackScreenProps<
  TransactionActionStackParamList,
  'ChangeEarningValidator'
>;
