import { combineReducers, configureStore } from '@reduxjs/toolkit';
import accountsReducer from './Accounts';
import priceReducer from './Price';
import networkMapReducer from './NetworkMap';
import settingsReducer from './Settings';
import currentNetworkReducer from './CurrentNetwork';
import chainRegistryReducer from './ChainRegistry';
import BalanceReducer from './Balance';
import SettingDataReducer from './SettingData';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  accounts: accountsReducer,
  price: priceReducer,
  networkMap: networkMapReducer,
  settings: settingsReducer,
  currentNetwork: currentNetworkReducer,
  chainRegistry: chainRegistryReducer,
  balance: BalanceReducer,
  settingData: SettingDataReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
