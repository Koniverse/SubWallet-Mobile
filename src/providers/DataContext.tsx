// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { persistor, store, StoreName } from '../stores';
import {
  subscribeAccountsData,
  subscribeAddressBook,
  subscribeAssetRegistry,
  subscribeAssetSettings,
  subscribeAuthorizeRequests,
  subscribeAuthUrls,
  subscribeBalance,
  subscribeChainInfoMap,
  subscribeChainStakingMetadata,
  subscribeChainStateMap,
  subscribeConfirmationRequests,
  subscribeCrowdloan,
  subscribeKeyringState,
  subscribeMetadataRequests,
  subscribeMultiChainAssetMap,
  subscribeNftCollections,
  subscribeNftItems,
  subscribePrice,
  subscribeSigningRequests,
  subscribeStaking,
  subscribeStakingNominatorMetadata,
  subscribeStakingReward,
  subscribeTransactionRequests,
  subscribeTxHistory,
  subscribeUiSettings,
  subscribeXcmRefMap,
  subscribeConnectWCRequests,
  subscribeWalletConnectSessions,
  subscribeProcessingCampaign,
  getMissionPoolData,
  subscribeBuyTokens,
  subscribeBuyServices,
  subscribeYieldPoolInfo,
  subscribeYieldPositionInfo,
  subscribeYieldReward,
  subscribeYieldMinAmountPercent,
  subscribeRewardHistory,
  subscribeChainStatusMap,
  getChainLogoMaps,
  getAssetsLogoMaps,
  subscribeSwapPairs,
} from 'stores/utils';
import React, { useContext, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { WebRunnerContext } from 'providers/contexts';

interface DataContextProviderProps {
  children?: React.ReactElement;
}

export type DataMap = Record<StoreName, boolean>;

export interface DataHandler {
  name: string;
  unsub?: () => void;
  isSubscription?: boolean;
  start: () => void;
  isStarted?: boolean;
  isStartImmediately?: boolean;
  promise?: Promise<any>;
  relatedStores: StoreName[];
}

export interface DataContextType {
  handlerMap: Record<string, DataHandler>;
  storeDependencies: Partial<Record<StoreName, string[]>>;
  readyStoreMap: DataMap;

  addHandler: (item: DataHandler) => () => void;
  removeHandler: (name: string) => void;
  awaitRequestsCache: Record<string, Promise<boolean>>;
  awaitStores: (storeNames: StoreName[], renew?: boolean) => Promise<boolean>;
}

const _DataContext: DataContextType = {
  handlerMap: {}, // Map to store data handlers
  storeDependencies: {}, // Map to store dependencies of each store
  awaitRequestsCache: {}, // Cache request promise to avoid rerender
  readyStoreMap: Object.keys(store.getState()).reduce((map, key) => {
    map[key as StoreName] = false; // Initialize each store to be not ready

    return map;
  }, {} as DataMap), // Convert the result to DataMap type
  addHandler: function (item: DataHandler) {
    // Add a new data handler
    const { name } = item;

    item.isSubscription = !!item.unsub; // Check if the handler has an unsubscribe function

    // If the handler doesn't exist in the map yet
    if (!this.handlerMap[name]) {
      this.handlerMap[name] = item; // Add the handler to the map
      item.relatedStores.forEach(storeName => {
        // If the store doesn't have any dependencies yet
        if (!this.storeDependencies[storeName]) {
          this.storeDependencies[storeName] = []; // Initialize an empty array for the store's dependencies
        }

        // Add the handler to the store's dependencies
        this.storeDependencies[storeName]?.push(name);
      });

      // If the handler is set to start immediately
      if (item.isStartImmediately) {
        item.start(); // Start the handler
        item.isStarted = true; // Mark the handler as started
      }
    }

    // Return a function to remove the handler
    return () => {
      this.removeHandler(name);
    };
  },
  removeHandler: function (name: string) {
    // Remove a data handler
    const item = this.handlerMap[name];

    // If the handler doesn't exist in the map
    if (!item) {
      return; // Return without doing anything
    }

    // If the handler has an unsubscribe function, call it
    item.unsub && item.unsub();
    // Remove the handler from all the store's dependencies
    Object.values(this.storeDependencies).forEach(handlers => {
      const removeIndex = handlers.indexOf(name);

      if (removeIndex >= 0) {
        handlers.splice(removeIndex, 1);
      }
    });

    // If the handler exists in the map, delete it
    if (this.handlerMap[name]) {
      delete this.handlerMap[name];
    }
  },
  awaitStores: function (storeNames: StoreName[], renew = false) {
    const key = storeNames.join('-');

    // Check await cache to avoid rerun many times
    if (!Object.hasOwnProperty.call(this.awaitRequestsCache, key) || renew) {
      const handlers = storeNames.reduce((acc, sName) => {
        (this.storeDependencies[sName] || []).forEach(handlerName => {
          if (!acc.includes(handlerName)) {
            acc.push(handlerName);
          }
        });

        return acc;
      }, [] as string[]);

      // Create an array of promises from the handlers
      const promiseList = handlers.map(siName => {
        const handler = this.handlerMap[siName];

        // Start the handler if it's not started or it's not a subscription and we want to renew
        if (!handler.isStarted || (!handler.isSubscription && renew)) {
          handler.start();
          handler.isStarted = true;
        }

        return handler.promise;
      });

      // Mark the store names as ready
      storeNames.forEach(n => {
        this.readyStoreMap[n] = true;
      });

      this.awaitRequestsCache[key] = Promise.all(promiseList).then(() => true);
    }

    // Wait for all handlers to finish
    return this.awaitRequestsCache[key];
  },
};

export const DataContext = React.createContext(_DataContext);

type WebRunnerFlagContext = {
  isStart: boolean;
  beforeWebRunnerReady?: boolean;
};

export const DataContextProvider = ({ children }: DataContextProviderProps) => {
  const isWebRunnerReady = useContext(WebRunnerContext).isReady;
  const readyFlag = useRef<WebRunnerFlagContext>({ isStart: true, beforeWebRunnerReady: isWebRunnerReady });

  useEffect(() => {
    // Init subscription
    // Common
    if (isWebRunnerReady) {
      // Init subscription if start and restart them if WebRunner is reload
      if (readyFlag.current.isStart) {
        /* Accounts */

        _DataContext.addHandler({
          ...subscribeAccountsData,
          name: 'subscribeAccountsData',
          relatedStores: ['accountState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeKeyringState,
          name: 'subscribeCurrentAccount',
          relatedStores: ['accountState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeAddressBook,
          name: 'subscribeAddressBook',
          relatedStores: ['accountState'],
          isStartImmediately: true,
        });

        /* Accounts */

        /* Chains */

        _DataContext.addHandler({
          ...subscribeChainStateMap,
          name: 'subscribeChainStateMap',
          relatedStores: ['chainStore'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeChainStatusMap,
          name: 'subscribeChainStatusMap',
          relatedStores: ['chainStore'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeChainInfoMap,
          name: 'subscribeChainInfoMap',
          relatedStores: ['chainStore'],
          isStartImmediately: true,
        });

        /* Chains */

        /* Assets */

        _DataContext.addHandler({
          ...subscribeAssetRegistry,
          name: 'subscribeAssetRegistry',
          relatedStores: ['assetRegistry'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeMultiChainAssetMap,
          name: 'subscribeMultiChainAssetMap',
          relatedStores: ['assetRegistry'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeAssetSettings,
          name: 'subscribeAssetSettings',
          relatedStores: ['assetRegistry'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeXcmRefMap,
          name: 'subscribeXcmRefMap',
          relatedStores: ['assetRegistry'],
          isStartImmediately: true,
        });

        /* Assets */

        /* Settings */

        _DataContext.addHandler({
          ...subscribeUiSettings,
          name: 'subscribeUiSettings',
          relatedStores: ['settings'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeAuthUrls,
          name: 'subscribeAuthUrls',
          relatedStores: ['settings'],
          isStartImmediately: true,
        });

        /* Settings */

        /* Logo */

        _DataContext.addHandler({
          ...getChainLogoMaps,
          name: 'getChainLogoMaps',
          relatedStores: ['logoMaps'],
          isStartImmediately: true,
        });

        _DataContext.addHandler({
          ...getAssetsLogoMaps,
          name: 'getAssetsLogoMaps',
          relatedStores: ['logoMaps'],
          isStartImmediately: true,
        });

        /* Logo */

        /* Requests */

        // Confirmations
        _DataContext.addHandler({
          ...subscribeAuthorizeRequests,
          name: 'subscribeAuthorizeRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeMetadataRequests,
          name: 'subscribeMetadataRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeSigningRequests,
          name: 'subscribeSigningRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeConfirmationRequests,
          name: 'subscribeConfirmationRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeTransactionRequests,
          name: 'subscribeTransactionRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeConnectWCRequests,
          name: 'subscribeConnectWCRequests',
          relatedStores: ['requestState'],
          isStartImmediately: true,
        });

        /* Requests */

        // Features
        _DataContext.addHandler({
          ...subscribeProcessingCampaign,
          name: 'subscribeProcessingCampaign',
          relatedStores: ['campaign'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribePrice,
          name: 'subscribePrice',
          relatedStores: ['price'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeBalance,
          name: 'subscribeBalance',
          relatedStores: ['balance'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({ ...subscribeCrowdloan, name: 'subscribeCrowdloan', relatedStores: ['crowdloan'] });
        _DataContext.addHandler({ ...subscribeNftItems, name: 'subscribeNftItems', relatedStores: ['nft'] });
        _DataContext.addHandler({
          ...subscribeNftCollections,
          name: 'subscribeNftCollections',
          relatedStores: ['nft'],
        });

        /* Staking */

        _DataContext.addHandler({ ...subscribeStaking, name: 'subscribeStaking', relatedStores: ['staking'] });
        _DataContext.addHandler({
          ...subscribeStakingReward,
          name: 'subscribeStakingReward',
          relatedStores: ['staking'],
        });
        _DataContext.addHandler({
          ...subscribeChainStakingMetadata,
          name: 'subscribeChainStakingMetadata',
          relatedStores: ['staking'],
        });
        _DataContext.addHandler({
          ...subscribeStakingNominatorMetadata,
          name: 'subscribeStakingNominatorMetadata',
          relatedStores: ['staking'],
        });

        /* Staking */

        _DataContext.addHandler({
          ...subscribeTxHistory,
          name: 'subscribeTxHistory',
          relatedStores: ['transactionHistory'],
        });
        _DataContext.addHandler({
          ...subscribeWalletConnectSessions,
          name: 'subscribeWalletConnectSessions',
          relatedStores: ['walletConnect'],
        });
        _DataContext.addHandler({
          ...getMissionPoolData,
          name: 'getMissionPoolData',
          relatedStores: ['missionPool'],
          isStartImmediately: true,
        });

        /* Buy service */

        _DataContext.addHandler({
          ...subscribeBuyTokens,
          name: 'subscribeBuyTokens',
          relatedStores: ['buyService'],
          isStartImmediately: true,
        });
        _DataContext.addHandler({
          ...subscribeBuyServices,
          name: 'subscribeBuyServices',
          relatedStores: ['buyService'],
          isStartImmediately: true,
        });

        /* Buy service */

        /* Earning */

        _DataContext.addHandler({
          ...subscribeYieldPoolInfo,
          name: 'subscribeYieldPoolInfo',
          relatedStores: ['earning'],
          isStartImmediately: true,
        });

        _DataContext.addHandler({
          ...subscribeYieldPositionInfo,
          name: 'subscribeYieldPositionInfo',
          relatedStores: ['earning'],
          isStartImmediately: true,
        });

        _DataContext.addHandler({
          ...subscribeYieldReward,
          name: 'subscribeYieldReward',
          relatedStores: ['earning'],
        });

        _DataContext.addHandler({
          ...subscribeRewardHistory,
          name: 'subscribeRewardHistory',
          relatedStores: ['earning'],
        });

        _DataContext.addHandler({
          ...subscribeYieldMinAmountPercent,
          name: 'subscribeYieldMinAmountPercent',
          relatedStores: ['earning'],
        });

        /* Earning */

        // Swap
        _DataContext.addHandler({
          ...subscribeSwapPairs,
          name: 'subscribeSwapPairs',
          relatedStores: ['swap'],
          isStartImmediately: true,
        });

        readyFlag.current.isStart = false;
      }
    }

    readyFlag.current.beforeWebRunnerReady = isWebRunnerReady;
  }, [isWebRunnerReady]);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <DataContext.Provider value={_DataContext}>{children}</DataContext.Provider>
      </PersistGate>
    </Provider>
  );
};
