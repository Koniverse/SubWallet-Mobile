// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthorizeRequest } from '@subwallet/extension-base/background/types';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { sendMessage } from 'messaging/index';

export async function subscribeAuthUrl(callback: (data: AuthUrls) => void): Promise<AuthUrls> {
  return sendMessage('pri(authorize.subscribe)', null, callback);
}

export async function subscribeAuthorizeRequests(cb: (accounts: AuthorizeRequest[]) => void): Promise<boolean> {
  return sendMessage('pri(authorize.requests)', null, cb);
}

export async function approveAuthRequest(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.approve)', { id });
}

export async function approveAuthRequestV2(id: string, accounts: string[]): Promise<boolean> {
  return sendMessage('pri(authorize.approveV2)', { id, accounts });
}

export async function rejectAuthRequest(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.reject)', { id });
}

export async function rejectAuthRequestV2(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.rejectV2)', { id });
}

export async function cancelAuthRequestV2(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.cancelV2)', { id });
}
