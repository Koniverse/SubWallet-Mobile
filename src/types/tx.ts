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
  txError?: Array<string>;
  extrinsicHash?: string;
}

export interface TransactionResultParams {
  txError: string;
  txSuccess: boolean;
  extrinsicHash?: string;
}
