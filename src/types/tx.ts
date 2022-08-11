import { TransferError } from '@subwallet/extension-base/background/KoniTypes';

export type TxParticipant = {
  address: string;
  networkKey: string;
};

export interface Tx {
  sender: TxParticipant;
  recipient: TxParticipant;
  hash: string;
}

export interface TransferResultType {
  isShowTxResult: boolean;
  isTxSuccess: boolean;
  txError?: Array<TransferError>;
  extrinsicHash?: string;
}
