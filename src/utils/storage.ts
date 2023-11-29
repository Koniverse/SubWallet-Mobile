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

// Backup and restore data on iOS 17
const isIOS17 = Platform.OS === 'ios' && getSystemVersion().startsWith('17');
export const backupStorageData = () => {
  if (isIOS17) {
    mobileBackup()
      .then(response => {
        mmkvStore.set('backup-indexedDB', response.indexedDB);
        mmkvStore.set('backup-localstorage', response.storage);
      })
      .catch(e => console.debug('** Backup storage data error:', e));
  }
};

export const restoreStorageData = () => {
  if (isIOS17) {
    const indexedDB = mmkvStore.getString('backup-indexedDB');
    const localstorage = mmkvStore.getString('backup-localstorage');
    mobileRestore({ indexedDB, storage: localstorage }).catch(e => console.debug('** Restore storage data error:', e));
  } else {
    mobileRestore({});
  }
};
