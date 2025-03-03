import { AmountData, RequestMaxTransferable } from '@subwallet/extension-base/background/KoniTypes';
import { RequestOptimalTransferProcess } from '@subwallet/extension-base/services/balance-service/helpers';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  RequestCrossChainTransfer,
  RequestGetTokensCanPayFee,
  TokenSpendingApprovalParams,
} from '@subwallet/extension-base/types';
import { CommonOptimalPath } from '@subwallet/extension-base/types/service-base';
import { sendMessage } from '..';
import {
  RequestSubmitTransfer,
  RequestSubscribeTransfer,
  ResponseSubscribeTransfer,
} from '@subwallet/extension-base/types/balance/transfer';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';

export async function makeTransfer(request: RequestSubmitTransfer): Promise<SWTransactionResponse> {
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

export async function subscribeMaxTransfer(
  request: RequestSubscribeTransfer,
  callback: (data: ResponseSubscribeTransfer) => void,
): Promise<ResponseSubscribeTransfer> {
  return sendMessage('pri(transfer.subscribe)', request, callback);
}

export async function getTokensCanPayFee(request: RequestGetTokensCanPayFee): Promise<TokenHasBalanceInfo[]> {
  // can set a default fee to ED of native token
  return sendMessage('pri(customFee.getTokensCanPayFee)', request);
}

export async function getOptimalTransferProcess(request: RequestOptimalTransferProcess): Promise<CommonOptimalPath> {
  return sendMessage('pri(accounts.getOptimalTransferProcess)', request);
}
