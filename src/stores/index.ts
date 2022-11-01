import { combineReducers, configureStore } from '@reduxjs/toolkit';
import accountsReducer from './Accounts';
import priceReducer from './Price';
import networkMapReducer from './NetworkMap';
import settingsReducer from './Settings';
import chainRegistryReducer from './ChainRegistry';
import balanceReducer from './Balance';
import mobileSettingsReducer from './MobileSettings';
import transactionHistoryReducer from './TransactionHistory';
import crowdloanReducer from './Crowdloan';
import confirmationReducer from './Confirmation';
import nftReducer from './Nft';
import nftCollectionReducer from './NftCollection';
import authUrlsReducer from './AuthUrls';
import appStateReducer from './AppState';
import browserReducer from './Browser';
import stakingReducer from './Staking';
import stakingRewardReducer from './StakingReward';
import stakeUnlockingReducer from './StakeUnlockingInfo';
import customTokenReducer from './CustomToken';
import backgroundServiceReducer from './BackgroundService';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: [
    'mobileSettings',
    'customToken',
    'accounts',
    'networkMap',
    'settings',
    'chainRegistry',
    'price',
    'balance',
    'crowdloan',
    'nftCollection',
    'nft',
    'authUrls',
    'browser',
    'staking',
    'stakeUnlockingInfo',
    'stakingReward',
  ],
};

const rootReducer = combineReducers({
  appState: appStateReducer,
  backgroundService: backgroundServiceReducer,
  accounts: accountsReducer,
  customToken: customTokenReducer,
  authUrls: authUrlsReducer,
  browser: browserReducer,
  price: priceReducer,
  networkMap: networkMapReducer,
  settings: settingsReducer,
  chainRegistry: chainRegistryReducer,
  balance: balanceReducer,
  mobileSettings: mobileSettingsReducer,
  transactionHistory: transactionHistoryReducer,
  crowdloan: crowdloanReducer,
  confirmation: confirmationReducer,
  nftCollection: nftCollectionReducer,
  nft: nftReducer,
  staking: stakingReducer,
  stakeUnlockingInfo: stakeUnlockingReducer,
  stakingReward: stakingRewardReducer,
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
