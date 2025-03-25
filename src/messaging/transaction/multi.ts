import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  RequestSubmitProcessTransaction,
  RequestSubscribeProcessById,
  ResponseSubscribeProcessById,
} from '@subwallet/extension-base/types';
import { sendMessage } from '..';

export async function submitProcess(request: RequestSubmitProcessTransaction): Promise<SWTransactionResponse> {
  return sendMessage('pri(process.transaction.submit)', request);
}

export async function subscribeProcess(
  request: RequestSubscribeProcessById,
  cb: (data: ResponseSubscribeProcessById) => void,
): Promise<ResponseSubscribeProcessById> {
  return sendMessage('pri(process.subscribe.id)', request, cb);
}
