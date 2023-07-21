import { combineReducers, configureStore } from '@reduxjs/toolkit';
import mobileSettingsReducer from './MobileSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appStateReducer from './AppState';
import appVersionReducer from './AppVersion';
import browserReducer from './Browser';
import backgroundServiceReducer from './BackgroundService';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistConfig,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

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
import WalletConnectReducer from './feature/WalletConnect';
import TransactionHistoryReducer from './feature/TransactionHistory';
import PasswordModalReducer from 'stores/PasswordModalState';
import LogoMap from 'stores/base/LogoMap';
import { mmkvReduxStore } from 'utils/storage';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { AssetRegistryStore, BalanceStore, BrowserSlice, ChainStore } from './types';

const persistRootConfig = {
  key: 'root',
  version: 3,
  storage: AsyncStorage,
  whitelist: ['mobileSettings', 'settings', 'appVersion'],
  blacklist: ['browser', 'price', 'balance', 'chainStore', 'assetRegistry'],
  migrate: async (state: any) => {
    if (state?._persist && state._persist.version < 3 && state.browser) {
      mmkvReduxStore.setItem('persist:browser', JSON.stringify(state.browser));
    }

    return state;
  },
};

const rootReducer = combineReducers({
  // Basic mobile app store
  appState: appStateReducer,
  mobileSettings: mobileSettingsReducer,
  browser: persistReducer({ key: 'browser', storage: mmkvReduxStore } as PersistConfig<BrowserSlice>, browserReducer),
  backgroundService: backgroundServiceReducer,
  passwordModalState: PasswordModalReducer,
  appVersion: appVersionReducer,

  //Feature
  transactionHistory: TransactionHistoryReducer,
  crowdloan: CrowdloanReducer,
  nft: NftReducer,
  staking: StakingReducer,
  price: persistReducer({ key: 'price', storage: mmkvReduxStore } as PersistConfig<PriceJson>, PriceReducer),
  balance: persistReducer({ key: 'balance', storage: mmkvReduxStore } as PersistConfig<BalanceStore>, BalanceReducer),
  bonding: BondingReducer,
  walletConnect: WalletConnectReducer,

  //Common
  chainStore: persistReducer(
    { key: 'chainStore', storage: mmkvReduxStore } as PersistConfig<ChainStore>,
    ChainStoreReducer,
  ),
  assetRegistry: persistReducer(
    { key: 'assetRegistry', storage: mmkvReduxStore } as PersistConfig<AssetRegistryStore>,
    AssetRegistryReducer,
  ),

  //Base
  requestState: RequestStateReducer,
  settings: SettingsReducer,
  accountState: AccountStateReducer,
  logoMaps: LogoMap,
});

const persistedReducer = persistReducer(persistRootConfig, rootReducer);

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
