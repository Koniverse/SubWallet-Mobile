import { sendMessage } from '..';
import { StorageDataInterface } from '@subwallet/extension-base/types';

export async function exportIndexedDB(): Promise<string> {
  return sendMessage('pri(database.export)', null);
}

export async function importIndexedDB(request: string): Promise<boolean> {
  return sendMessage('pri(database.import)', request);
}

export async function getIndexedDBJson(): Promise<object> {
  return sendMessage('pri(database.exportJson)', null);
}

export async function migrateLocalStorage(request: string): Promise<boolean> {
  return sendMessage('pri(database.migrateLocalStorage)', request);
}

export async function setValueLocalStorageWS(request: StorageDataInterface): Promise<boolean> {
  return sendMessage('pri(database.setLocalStorage)', request);
}

export async function getValueLocalStorageWS(request: string): Promise<string | null> {
  return sendMessage('pri(database.getLocalStorage)', request);
}
