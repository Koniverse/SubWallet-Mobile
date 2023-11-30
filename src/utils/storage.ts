import { mobileBackup, mobileRestore } from 'messaging/index';
import { Platform } from 'react-native';
import { getSystemVersion } from 'react-native-device-info';
import { MMKV } from 'react-native-mmkv';
import { Storage } from 'redux-persist';

const storage = new MMKV();

export const mmkvStore = storage;

export const mmkvReduxStore: Storage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  getItem: key => {
    const value = storage.getString(key);
    return Promise.resolve(value || null);
  },
  removeItem: key => {
    storage.delete(key);
    return Promise.resolve();
  },
};

// Backup and restore data
export const backupStorageData = (forceBackup?: boolean) => {
  mobileBackup()
    .then(response => {
      if (typeof response.storage !== 'string') {
        return;
      }
      const preBackupData = JSON.parse(response.storage);
      const isAccount = Object.keys(preBackupData).find((item: string) => item.startsWith('account:'));
      if ((isAccount && preBackupData['keyring:subwallet']) || forceBackup) {
        mmkvStore.set('backup-indexedDB', response.indexedDB);
        mmkvStore.set('backup-localstorage', response.storage);
      }
    })
    .catch(e => console.debug('** Backup storage data error:', e));
};

export const restoreStorageData = () => {
  const indexedDB = mmkvStore.getString('backup-indexedDB');
  const localstorage = mmkvStore.getString('backup-localstorage');
  mobileRestore({ indexedDB, storage: localstorage }).catch(e => console.debug('** Restore storage data error:', e));
};
