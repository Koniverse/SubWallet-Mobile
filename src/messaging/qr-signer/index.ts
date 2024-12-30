import {
  RequestParseTransactionSubstrate,
  RequestQrSignEvm,
  RequestQrSignSubstrate,
  ResponseAccountIsLocked,
  ResponseParseTransactionSubstrate,
  ResponseQrParseRLP,
  ResponseQrSignEvm,
  ResponseQrSignSubstrate,
} from '@subwallet/extension-base/background/KoniTypes';

import { sendMessage } from '..';

export async function accountIsLocked(address: string): Promise<ResponseAccountIsLocked> {
  return sendMessage('pri(account.isLocked)', { address });
}

export async function qrSignSubstrate(request: RequestQrSignSubstrate): Promise<ResponseQrSignSubstrate> {
  return sendMessage('pri(qr.sign.substrate)', request);
}

export async function qrSignEvm(request: RequestQrSignEvm): Promise<ResponseQrSignEvm> {
  return sendMessage('pri(qr.sign.evm)', request);
}

export async function parseSubstrateTransaction(
  request: RequestParseTransactionSubstrate,
): Promise<ResponseParseTransactionSubstrate> {
  return sendMessage('pri(qr.transaction.parse.substrate)', request);
}

export async function parseEVMTransaction(data: string): Promise<ResponseQrParseRLP> {
  return sendMessage('pri(qr.transaction.parse.evm)', { data });
}
