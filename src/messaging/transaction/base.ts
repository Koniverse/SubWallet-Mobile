import { AmountData, AmountDataWithId, RequestFreeBalance } from '@subwallet/extension-base/background/KoniTypes';

import { sendMessage } from '..';

export async function getFreeBalance(request: RequestFreeBalance): Promise<AmountData> {
  return sendMessage('pri(freeBalance.get)', request);
}

export async function subscribeFreeBalance(
  request: RequestFreeBalance,
  callback: (balance: AmountDataWithId) => void,
): Promise<AmountDataWithId> {
  return sendMessage('pri(freeBalance.subscribe)', request, callback);
}
