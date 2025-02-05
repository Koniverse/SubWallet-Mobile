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
import StaticContentReducer from './base/StaticContent';
import BalanceReducer from './feature/Balance';
import BondingReducer from './feature/Bonding';
import CampaignReducer from './feature/Campaign';
import MissionPoolReducer from './feature/MissionPool';
import BuyServiceReducer from './feature/Buy';
import AssetRegistryReducer from './feature/common/AssetRegistry';
import ChainStoreReducer from './feature/common/ChainStore';
import ChainInfoMapReducer from './feature/common/ChainInfoMap';
import CrowdloanReducer from './feature/Crowdloan';
import NftReducer from './feature/Nft';
import PriceReducer from './feature/Price';
import EarningReducer from './feature/Earning';
import StakingReducer from './feature/Staking';
import WalletConnectReducer from './feature/WalletConnect';
import MantaPayReducer from './feature/MantaPay';
import TransactionHistoryReducer from './feature/TransactionHistory';
import PasswordModalReducer from 'stores/PasswordModalState';
import SwapReducer from './feature/Swap';
import NotificationReducer from './feature/Notification';
import LogoMap from 'stores/base/LogoMap';
import { getDevMode, mmkvReduxStore } from 'utils/storage';
import { PriceJson } from '@subwallet/extension-base/background/KoniTypes';
import { AppOnlineContent, AssetRegistryStore, BalanceStore, BrowserSlice, ChainStore } from './types';
import { browserDAPPs, tokenConfig } from './API';
import { setupListeners } from '@reduxjs/toolkit/query';

const persistRootConfig = {
  key: 'root',
  version: 3,
  storage: AsyncStorage,
  whitelist: ['mobileSettings', 'settings', 'appVersion', 'campaign'],
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

  // Feature
  transactionHistory: TransactionHistoryReducer,
  crowdloan: CrowdloanReducer,
  nft: NftReducer,
  staking: StakingReducer,
  price: persistReducer({ key: 'price', storage: mmkvReduxStore } as PersistConfig<PriceJson>, PriceReducer),
  balance: persistReducer({ key: 'balance', storage: mmkvReduxStore } as PersistConfig<BalanceStore>, BalanceReducer),
  bonding: BondingReducer,
  walletConnect: WalletConnectReducer,
  campaign: CampaignReducer,
  buyService: BuyServiceReducer,
  swap: SwapReducer,
  // mission pool
  missionPool: MissionPoolReducer,
  mantaPay: MantaPayReducer,

  // Common
  chainStore: persistReducer(
    { key: 'chainStore', storage: mmkvReduxStore } as PersistConfig<ChainStore>,
    ChainStoreReducer,
  ),
  assetRegistry: persistReducer(
    { key: 'assetRegistry', storage: mmkvReduxStore } as PersistConfig<AssetRegistryStore>,
    AssetRegistryReducer,
  ),
  chainInfoMap: persistReducer(
    { key: 'chainInfoMap', storage: mmkvReduxStore } as PersistConfig<ChainStore['chainInfoMap']>,
    ChainInfoMapReducer,
  ),
  notification: NotificationReducer,

  // Base
  requestState: RequestStateReducer,
  settings: SettingsReducer,
  staticContent: persistReducer(
    { key: 'staticContent', storage: mmkvReduxStore } as PersistConfig<AppOnlineContent>,
    StaticContentReducer,
  ),
  accountState: AccountStateReducer,
  logoMaps: LogoMap,
  earning: EarningReducer,

  // API
  [browserDAPPs.reducerPath]: persistReducer(
    { key: browserDAPPs.reducerPath, storage: mmkvReduxStore },
    browserDAPPs.reducer,
  ),
  [tokenConfig.reducerPath]: persistReducer(
    { key: tokenConfig.reducerPath, storage: mmkvReduxStore },
    tokenConfig.reducer,
  ),
});

const persistedReducer = persistReducer(persistRootConfig, rootReducer);
const isDevMode = getDevMode();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: isDevMode
        ? false
        : {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
      immutableCheck: !isDevMode,
    })
      .concat(browserDAPPs.middleware)
      .concat(tokenConfig.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type StoreName = keyof RootState;
export type AppDispatch = typeof store.dispatch;
