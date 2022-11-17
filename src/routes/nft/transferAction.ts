import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SubstrateTransferParams, TransferNftParams, Web3TransferParams } from 'types/nft';
import { TransactionResultParams } from 'types/tx';

export type NftTransferActionStackParamList = {
  NftTransferConfirm: TransferNftParams;
  NftTransferAuth: {
    transferParams: TransferNftParams;
    recipientAddress: string;
    substrateTransferParams: SubstrateTransferParams | null;
    web3TransferParams: Web3TransferParams | null;
  };
  NftTransferResult: {
    transferParams: TransferNftParams;
    txParams: TransactionResultParams;
  };
};

export type NavigationProps = NativeStackScreenProps<NftTransferActionStackParamList>;
export type NftTransferActionNavigationProps = NavigationProps['navigation'];

export type NftTransferConfirmProps = NativeStackScreenProps<NftTransferActionStackParamList, 'NftTransferConfirm'>;
export type NftTransferAuthProps = NativeStackScreenProps<NftTransferActionStackParamList, 'NftTransferAuth'>;
export type NftTransferResultProps = NativeStackScreenProps<NftTransferActionStackParamList, 'NftTransferResult'>;
