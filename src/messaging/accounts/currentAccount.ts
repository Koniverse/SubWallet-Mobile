import { RequestCurrentAccountAddress } from '@subwallet/extension-base/background/types';
import { CurrentAccountInfo } from '@subwallet/extension-base/types';
import { sendMessage } from '..';

export async function saveCurrentAccountAddress(data: RequestCurrentAccountAddress): Promise<CurrentAccountInfo> {
  return sendMessage('pri(accounts.saveCurrentProxy)', data);
}
