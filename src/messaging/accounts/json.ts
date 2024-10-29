import {
  RequestBatchJsonGetAccountInfo,
  RequestBatchRestoreV2,
  RequestJsonGetAccountInfo,
  RequestJsonRestoreV2,
  ResponseBatchJsonGetAccountInfo,
  ResponseJsonGetAccountInfo,
} from '@subwallet/extension-base/types';
import { sendMessage } from 'messaging/index';

export async function parseInfoSingleJson(request: RequestJsonGetAccountInfo): Promise<ResponseJsonGetAccountInfo> {
  return sendMessage('pri(accounts.json.info)', request);
}

export async function jsonRestoreV2(request: RequestJsonRestoreV2): Promise<string[]> {
  return sendMessage('pri(accounts.json.restoreV2)', request);
}

export async function parseBatchSingleJson(
  request: RequestBatchJsonGetAccountInfo,
): Promise<ResponseBatchJsonGetAccountInfo> {
  return sendMessage('pri(accounts.json.batchInfo)', request);
}

export async function batchRestoreV2(request: RequestBatchRestoreV2): Promise<string[]> {
  return sendMessage('pri(accounts.json.batchRestoreV2)', request);
}
