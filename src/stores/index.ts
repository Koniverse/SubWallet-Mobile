import { combineReducers, configureStore } from '@reduxjs/toolkit';
import mobileSettingsReducer from './MobileSettings';
import appStateReducer from './AppState';
import appVersionReducer from './AppVersion';
import browserReducer from './Browser';
import backgroundServiceReducer from './BackgroundService';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import AccountStateReducer from './base/AccountState';
import RequestStateReducer from './base/RequestState';
import SettingsReducer from './base/Settings';
import BalanceReducer from './feature/Balance';
import BondingReducer from './feature/Bonding';
import AssetRegistryReducer from './feature/common/AssetRegistry';
import ChainStoreReducer from './feature/common/ChainStore';
import CrowdloanReducer from './feature/Crowdloan';
import NftReducer from './feature/Nft';
import PriceReducer from './feature/Price';
import StakingReducer from './feature/Staking';
import TransactionHistoryReducer from './feature/TransactionHistory';
import PasswordModalReducer from 'stores/PasswordModalState';
import LogoMap from 'stores/base/LogoMap';
import { reduxStorage } from 'utils/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: reduxStorage,
  whitelist: ['mobileSettings', 'browser', 'settings', 'appVersion'],
};

const rootReducer = combineReducers({
  // Basic mobile app store
  appState: appStateReducer,
  mobileSettings: mobileSettingsReducer,
  browser: browserReducer,
  backgroundService: backgroundServiceReducer,
  passwordModalState: PasswordModalReducer,
  appVersion: appVersionReducer,

  // // Feature
  transactionHistory: TransactionHistoryReducer,
  crowdloan: CrowdloanReducer,
  nft: NftReducer,
  staking: StakingReducer,
  price: PriceReducer,
  balance: BalanceReducer,
  bonding: BondingReducer,

  // // Common
  chainStore: ChainStoreReducer,
  assetRegistry: AssetRegistryReducer,

  // // Base
  requestState: RequestStateReducer,
  settings: SettingsReducer,
  accountState: AccountStateReducer,
  logoMaps: LogoMap,
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
export type StoreName = keyof RootState;
export type AppDispatch = typeof store.dispatch;
