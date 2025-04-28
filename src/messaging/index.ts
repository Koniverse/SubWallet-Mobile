import {
  CronReloadRequest,
  CronServiceType,
  MobileData,
  ResponseSubscribeHistory,
  SubscriptionServiceType,
  TransactionHistoryItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { sendMessage } from 'messaging/base';

// Controller messages

export async function mobileBackup(): Promise<MobileData> {
  return sendMessage('mobile(storage.backup)');
}
export async function mobileRestore(request: Partial<MobileData>): Promise<null> {
  return sendMessage('mobile(storage.restore)', request);
}

export async function reloadCron(request: CronReloadRequest): Promise<boolean> {
  return sendMessage('pri(cron.reload)', request);
}

export async function startCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.start)', request);
}

export async function stopCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.stop)', request);
}

export async function restartCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.restart)', request);
}

export async function startSubscriptionServices(request: SubscriptionServiceType[]): Promise<void> {
  return sendMessage('mobile(subscription.start)', request);
}

export async function stopSubscriptionServices(request: SubscriptionServiceType[]): Promise<void> {
  return sendMessage('mobile(subscription.stop)', request);
}

export async function subscribeTransactionHistory(
  chain: string,
  address: string,
  callback: (items: TransactionHistoryItem[]) => void,
): Promise<ResponseSubscribeHistory> {
  return sendMessage('pri(transaction.history.subscribe)', { address, chain }, callback);
}

export * from './accounts';
export * from './base';
export * from './confirmation';
export * from './transaction';
export * from './settings';
export * from './qr-signer';
export * from './keyring';
export * from './wallet-connect';
export * from './manta-pay';
export * from './domain';
export * from './metadata';
export * from './campaigns';
export * from './database';
export * from './migrate-unified-account';
