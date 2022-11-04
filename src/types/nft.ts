import { NftItem } from '@subwallet/extension-base/background/KoniTypes';

export interface Web3TransferParams {
  rawTx: Record<string, any>;
  estimatedGas: string;
  balanceError: boolean;
}

export interface SubstrateTransferParams {
  params: Record<string, any>;
  estimatedFee?: string;
  balanceError?: boolean;
}

export enum SUPPORTED_TRANSFER_CHAIN_NAME {
  statemine = 'statemine',
  acala = 'acala',
  karura = 'karura',
  kusama = 'kusama',
  unique_network = 'unique_network',
  quartz = 'quartz',
  opal = 'opal',
  statemint = 'statemint',
  bitcountry = 'bitcountry',
  pioneer = 'pioneer',
}

export const SUPPORTED_TRANSFER_SUBSTRATE_CHAIN = [
  SUPPORTED_TRANSFER_CHAIN_NAME.statemine as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.acala as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.karura as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.kusama as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.unique_network as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.quartz as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.opal as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.statemint as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.bitcountry as string,
  SUPPORTED_TRANSFER_CHAIN_NAME.pioneer as string,
];

export interface TransferResponse {
  // substrate
  estimatedFee?: string;
  // eth
  web3RawTx?: Record<string, any>;
  estimatedGas?: string;
  // common
  balanceError?: boolean;
}

export type TransferNftParams = {
  nftItem: NftItem;
  collectionImage?: string;
  collectionId: string;
  senderAddress: string;
};
