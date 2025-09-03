import { RequestAuthorizationBlock, RequestAuthorizationPerSite, RequestSwitchCurrentNetworkAuthorization } from '@subwallet/extension-base/background/KoniTypes';
import { ResponseAuthorizeList } from '@subwallet/extension-base/background/types';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { sendMessage } from '..';

export async function getAuthList(): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.list)');
}

export async function getAuthListV2(): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.listV2)');
}

export async function toggleAuthorization(url: string): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.toggle)', url);
}

export async function switchCurrentNetworkAuthorization(
  request: RequestSwitchCurrentNetworkAuthorization,
): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.switchCurrentNetwork)', request);
}

export async function changeAuthorizationAll(
  connectValue: boolean,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSiteAll)', { connectValue }, callback);
}

export async function changeAuthorization(
  connectValue: boolean,
  url: string,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSite)', { url, connectValue }, callback);
}

export async function changeAuthorizationPerSite(request: RequestAuthorizationPerSite): Promise<boolean> {
  return sendMessage('pri(authorize.changeSitePerSite)', request);
}

export async function changeAuthorizationBlock(request: RequestAuthorizationBlock): Promise<boolean> {
  return sendMessage('pri(authorize.changeSiteBlock)', request);
}

export async function changeAuthorizationPerAccount(
  address: string,
  connectValue: boolean,
  url: string,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSitePerAccount)', { address, url, connectValue }, callback);
}

export async function forgetSite(url: string, callback: (data: AuthUrls) => void): Promise<boolean> {
  return sendMessage('pri(authorize.forgetSite)', { url }, callback);
}

export async function forgetAllSite(callback: (data: AuthUrls) => void): Promise<boolean> {
  return sendMessage('pri(authorize.forgetAllSite)', null, callback);
}
