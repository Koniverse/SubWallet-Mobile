import { combineReducers, configureStore } from '@reduxjs/toolkit';
import accountsReducer from './Accounts';
import priceReducer from './Price';
import networkMapReducer from './NetworkMap';
import settingsReducer from './Settings';
import chainRegistryReducer from './ChainRegistry';
import BalanceReducer from './Balance';
import MobileSettingsReducer from './MobileSettings';
import TransactionHistoryReducer from './TransactionHistory';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['mobileSettings', 'networkMap', 'settings', 'chainRegistry'],
};

const rootReducer = combineReducers({
  accounts: accountsReducer,
  price: priceReducer,
  networkMap: networkMapReducer,
  settings: settingsReducer,
  chainRegistry: chainRegistryReducer,
  balance: BalanceReducer,
  mobileSettings: MobileSettingsReducer,
  transactionHistory: TransactionHistoryReducer,
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
