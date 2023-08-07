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
