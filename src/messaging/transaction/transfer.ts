import { AmountData, RequestMaxTransferable } from '@subwallet/extension-base/background/KoniTypes';
import { RequestOptimalTransferProcess } from '@subwallet/extension-base/services/balance-service/helpers';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  RequestCrossChainTransfer,
  RequestTransfer,
  TokenSpendingApprovalParams,
} from '@subwallet/extension-base/types';
import { CommonOptimalPath } from '@subwallet/extension-base/types/service-base';
import { sendMessage } from '..';

export async function makeTransfer(request: RequestTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.transfer)', request);
}

export async function makeCrossChainTransfer(request: RequestCrossChainTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.crossChainTransfer)', request);
}

export async function approveSpending(request: TokenSpendingApprovalParams): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.approveSpending)', request);
}

export async function getMaxTransfer(request: RequestMaxTransferable): Promise<AmountData> {
  return sendMessage('pri(transfer.getMaxTransferable)', request);
}

export async function getOptimalTransferProcess(request: RequestOptimalTransferProcess): Promise<CommonOptimalPath> {
  return sendMessage('pri(accounts.getOptimalTransferProcess)', request);
}
