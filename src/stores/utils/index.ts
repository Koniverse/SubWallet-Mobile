// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetRef, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import {
  AddressBookInfo,
  AssetSetting,
  CampaignBanner,
  ChainStakingMetadata,
  ConfirmationsQueue,
  ConfirmationsQueueTon,
  CrowdloanJson,
  KeyringState,
  MantaPayConfig,
  MantaPaySyncState,
  NftCollection,
  NftJson,
  NominatorMetadata,
  PriceJson,
  StakingJson,
  StakingRewardJson,
  ThemeNames,
  TokenPriorityDetails,
  TransactionHistoryItem,
  UiSettings,
} from '@subwallet/extension-base/background/KoniTypes';
import {
  AccountsContext,
  AuthorizeRequest,
  ConfirmationRequestBase,
  MetadataRequest,
  SigningRequest,
} from '@subwallet/extension-base/background/types';
import { _ChainApiStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { addLazy } from '@subwallet/extension-base/utils';
import { lazySubscribeMessage } from 'messaging/index';
import { AppSettings } from 'stores/types';
import { store } from '..';
import { WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { SessionTypes } from '@walletconnect/types';
import { MissionInfo } from 'types/missionPool';
import { BuyServiceInfo } from 'types/buy';
import {
  AccountJson,
  AccountProxy,
  AccountsWithCurrentAddress,
  BalanceJson,
  BuyTokenInfo,
  EarningRewardHistoryItem,
  EarningRewardJson,
  ResponseSubscribeProcessAlive,
  YieldPoolInfo,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { getStaticContentByDevMode, mmkvStore } from 'utils/storage';
import { RootRouteProps } from 'routes/index';
import { SwapPair } from '@subwallet/extension-base/types/swap';
import { fetchStaticData } from 'utils/fetchStaticData';
import {
  AppBannerData,
  AppConfirmationData,
  AppPopupData,
} from '@subwallet/extension-base/services/mkt-campaign-service/types';
// Setup redux stores

function voidFn() {
  // do nothing
}

// Base
// AccountState store
export const updateCurrentAccountProxy = (accountProxy: AccountProxy) => {
  store.dispatch({ type: 'accountState/updateCurrentAccountProxy', payload: accountProxy });
};

export const updateAccountProxies = (data: AccountProxy[]) => {
  store.dispatch({ type: 'accountState/updateAccountProxies', payload: data });
};

export const updateAccountData = (data: AccountsWithCurrentAddress) => {
  let currentAccountProxy: AccountProxy = data.accounts[0];
  const accountProxies = data.accounts;

  accountProxies.forEach(ap => {
    if (ap.id === data.currentAccountProxy) {
      currentAccountProxy = ap;
    }
  });
  updateCurrentAccountProxy(currentAccountProxy);
  updateAccountProxies(accountProxies);
};

export const updateCurrentAccountState = (currentAccountJson: AccountJson) => {
  store.dispatch({ type: 'accountState/updateCurrentAccount', payload: currentAccountJson });
};

export const updateAccountsContext = (data: AccountsContext) => {
  store.dispatch({ type: 'accountState/updateAccountsContext', payload: data });
};

export const subscribeAccountsData = lazySubscribeMessage(
  'pri(accounts.subscribeWithCurrentProxy)',
  {},
  updateAccountData,
  updateAccountData,
);

export const updateKeyringState = (data: KeyringState) => {
  store.dispatch({ type: 'accountState/updateKeyringState', payload: data });
};

export const subscribeKeyringState = lazySubscribeMessage(
  'pri(keyring.subscribe)',
  null,
  updateKeyringState,
  updateKeyringState,
);

export const updateAddressBook = (data: AddressBookInfo) => {
  store.dispatch({ type: 'accountState/updateAddressBook', payload: data });
};

export const subscribeAddressBook = lazySubscribeMessage(
  'pri(addressBook.subscribe)',
  null,
  updateAddressBook,
  updateAddressBook,
);

function convertConfirmationToMap(data: ConfirmationRequestBase[]) {
  return data.reduce((prev, request) => {
    prev[request.id] = request;

    return prev;
  }, {} as Record<string, ConfirmationRequestBase>);
}

export const updateAuthorizeRequests = (data: AuthorizeRequest[]) => {
  // Convert data to object with key as id
  const requests = convertConfirmationToMap(data);

  store.dispatch({ type: 'requestState/updateAuthorizeRequests', payload: requests });
};

export const subscribeAuthorizeRequests = lazySubscribeMessage(
  'pri(authorize.requestsV2)',
  null,
  voidFn,
  updateAuthorizeRequests,
);

export const updateMetadataRequests = (data: MetadataRequest[]) => {
  // Convert data to object with key as id
  const requests = convertConfirmationToMap(data);

  store.dispatch({ type: 'requestState/updateMetadataRequests', payload: requests });
};

export const subscribeMetadataRequests = lazySubscribeMessage(
  'pri(metadata.requests)',
  null,
  voidFn,
  updateMetadataRequests,
);

export const updateSigningRequests = (data: SigningRequest[]) => {
  // Convert data to object with key as id
  const requests = convertConfirmationToMap(data);

  store.dispatch({ type: 'requestState/updateSigningRequests', payload: requests });
};

export const subscribeSigningRequests = lazySubscribeMessage(
  'pri(signing.requests)',
  null,
  voidFn,
  updateSigningRequests,
);

export const updateConfirmationRequests = (data: ConfirmationsQueue) => {
  store.dispatch({ type: 'requestState/updateConfirmationRequests', payload: data });
};

export const subscribeConfirmationRequests = lazySubscribeMessage(
  'pri(confirmations.subscribe)',
  null,
  updateConfirmationRequests,
  updateConfirmationRequests,
);

export const updateConfirmationRequestsTon = (data: ConfirmationsQueueTon) => {
  store.dispatch({ type: 'requestState/updateConfirmationRequestsTon', payload: data });
};

export const subscribeConfirmationRequestsTon = lazySubscribeMessage(
  'pri(confirmationsTon.subscribe)',
  null,
  updateConfirmationRequestsTon,
  updateConfirmationRequestsTon,
);

export const updateTransactionRequests = (data: Record<string, SWTransactionResult>) => {
  // Convert data to object with key as id

  store.dispatch({ type: 'requestState/updateTransactionRequests', payload: data });
};

export const subscribeTransactionRequests = lazySubscribeMessage(
  'pri(transactions.subscribe)',
  null,
  updateTransactionRequests,
  updateTransactionRequests,
);

// Settings Store
export const updateTheme = (theme: ThemeNames) => {
  store.dispatch({ type: 'settings/updateTheme', payload: theme });
};

export const updateShowZeroBalanceState = (isShow: boolean) => {
  store.dispatch({ type: 'settings/updateShowZeroBalanceState', payload: isShow });
};

export const updateLanguage = (lang: AppSettings['language']) => {
  store.dispatch({ type: 'settings/updateLanguage', payload: lang });
};

export const updateBrowserConfirmationType = (type: AppSettings['browserConfirmationType']) => {
  store.dispatch({ type: 'settings/updateBrowserConfirmationType', payload: type });
};

export const updateUiSettings = (data: UiSettings) => {
  store.dispatch({ type: 'settings/updateUiSettings', payload: data });
};

export const subscribeUiSettings = lazySubscribeMessage(
  'pri(settings.subscribe)',
  null,
  updateUiSettings,
  updateUiSettings,
);

export const updateChainLogoMaps = (data: Record<string, string>) => {
  addLazy(
    'updateChainLogoMaps',
    () => {
      store.dispatch({ type: 'logoMaps/updateChainLogoMaps', payload: data });
    },
    100,
    300,
    false,
  );
};

export const updateAssetLogoMaps = (data: Record<string, string>) => {
  addLazy(
    'updateAssetLogoMaps',
    () => {
      store.dispatch({ type: 'logoMaps/updateAssetLogoMaps', payload: data });
    },
    100,
    300,
    false,
  );
};

export const getChainLogoMaps = lazySubscribeMessage(
  'pri(settings.logo.chains.subscribe)',
  null,
  updateChainLogoMaps,
  updateChainLogoMaps,
);
export const getAssetsLogoMaps = lazySubscribeMessage(
  'pri(settings.logo.assets.subscribe)',
  null,
  updateAssetLogoMaps,
  updateAssetLogoMaps,
);

//
// export const updateAppSettings = (data: AccountJson) => {
//   store.dispatch({ type: 'accountState/updateCurrentAccount', payload: data });
// };
//
// export const subscribeAppSettings = lazySubscribeMessage('pri(accounts.subscribeWithCurrentAddress)', {}, updateCurrentAccountState, updateCurrentAccountState);
//

export const updateMantaPayConfig = (data: MantaPayConfig[]) => {
  store.dispatch({ type: 'mantaPay/updateConfig', payload: data });
};

export const subscribeMantaPayConfig = lazySubscribeMessage(
  'pri(mantaPay.subscribeConfig)',
  null,
  updateMantaPayConfig,
  updateMantaPayConfig,
);

export const updateMantaPaySyncing = (data: MantaPaySyncState) => {
  store.dispatch({ type: 'mantaPay/updateIsSyncing', payload: data });
};

export const subscribeMantaPaySyncingState = lazySubscribeMessage(
  'pri(mantaPay.subscribeSyncingState)',
  null,
  updateMantaPaySyncing,
  updateMantaPaySyncing,
);

export const updateAuthUrls = (data: AuthUrls) => {
  store.dispatch({ type: 'settings/updateAuthUrls', payload: data });
};

export const updateCurrentRoute = (data: RootRouteProps | undefined) => {
  store.dispatch({ type: 'settings/updateCurrentRoute', payload: data });
};

export const subscribeAuthUrls = lazySubscribeMessage('pri(authorize.subscribe)', null, updateAuthUrls, updateAuthUrls);

// export const updateMediaAllowance = (data: AccountJson) => {
//   store.dispatch({ type: 'accountState/updateCurrentAccount', payload: data });
// };
//
// export const subscribeMediaAllowance = lazySubscribeMessage('pri(accounts.subscribeWithCurrentAddress)', {}, updateCurrentAccountState, updateCurrentAccountState);

export const updateChainInfoMap = (data: Record<string, _ChainInfo>) => {
  store.dispatch({ type: 'chainStore/updateChainInfoMap', payload: data });
};

export const subscribeChainInfoMap = lazySubscribeMessage(
  'pri(chainService.subscribeChainInfoMap)',
  null,
  updateChainInfoMap,
  updateChainInfoMap,
);

export const updateChainStateMap = (data: Record<string, _ChainState>) => {
  if (data && Object.keys(data).length > 0) {
    store.dispatch({ type: 'chainStore/updateChainStateMap', payload: data });
  }
};

export const subscribeChainStateMap = lazySubscribeMessage(
  'pri(chainService.subscribeChainStateMap)',
  null,
  updateChainStateMap,
  updateChainStateMap,
);

export const updateChainStatusMap = (data: Record<string, _ChainApiStatus>) => {
  if (data && Object.keys(data).length > 0) {
    addLazy(
      'updateChainStatusMap',
      () => {
        store.dispatch({ type: 'chainStore/updateChainStatusMap', payload: data });
      },
      200,
      600,
    );
  }
};

export const subscribeChainStatusMap = lazySubscribeMessage(
  'pri(chainService.subscribeChainStatusMap)',
  null,
  updateChainStatusMap,
  updateChainStatusMap,
);

export const updateAssetRegistry = (data: Record<string, _ChainAsset>) => {
  // TODO useTokenGroup
  store.dispatch({ type: 'assetRegistry/updateAssetRegistry', payload: data });
};

export const subscribeAssetRegistry = lazySubscribeMessage(
  'pri(chainService.subscribeAssetRegistry)',
  null,
  updateAssetRegistry,
  updateAssetRegistry,
);

export const updateMultiChainAssetRegistry = (data: Record<string, _MultiChainAsset>) => {
  store.dispatch({ type: 'assetRegistry/updateMultiChainAssetMap', payload: data });
};

export const subscribeMultiChainAssetMap = lazySubscribeMessage(
  'pri(chainService.subscribeMultiChainAssetMap)',
  null,
  updateMultiChainAssetRegistry,
  updateMultiChainAssetRegistry,
);

export const updateXcmRefMap = (data: Record<string, _AssetRef>) => {
  store.dispatch({ type: 'assetRegistry/updateXcmRefMap', payload: data });
};

export const subscribeXcmRefMap = lazySubscribeMessage(
  'pri(chainService.subscribeXcmRefMap)',
  null,
  updateXcmRefMap,
  updateXcmRefMap,
);

export const updateAssetSettingMap = (data: Record<string, AssetSetting>) => {
  store.dispatch({ type: 'assetRegistry/updateAssetSettingMap', payload: data });
};

export const subscribeAssetSettings = lazySubscribeMessage(
  'pri(assetSetting.getSubscription)',
  null,
  updateAssetSettingMap,
  updateAssetSettingMap,
);

// Features
export const updatePrice = (data: PriceJson) => {
  store.dispatch({ type: 'price/updatePrice', payload: data });
};

export const subscribePrice = lazySubscribeMessage('pri(price.getSubscription)', null, updatePrice, updatePrice);

export const updateBalance = (data: BalanceJson) => {
  if (data.details && Object.keys(data.details).length > 0) {
    addLazy(
      'updateBalanceStore',
      () => {
        store.dispatch({ type: 'balance/update', payload: data.details });
      },
      900,
    );
  }
};

export const subscribeBalance = lazySubscribeMessage(
  'pri(balance.getSubscription)',
  null,
  updateBalance,
  updateBalance,
);

export const updateCrowdloan = (data: CrowdloanJson) => {
  store.dispatch({ type: 'crowdloan/update', payload: data.details });
};

export const subscribeCrowdloan = lazySubscribeMessage(
  'pri(crowdloan.getSubscription)',
  null,
  updateCrowdloan,
  updateCrowdloan,
);

export const updateNftItems = (data: NftJson) => {
  store.dispatch({ type: 'nft/updateNftItems', payload: data.nftList });
};

export const subscribeNftItems = lazySubscribeMessage('pri(nft.getSubscription)', null, updateNftItems, updateNftItems);

export const updateNftCollections = (data: NftCollection[]) => {
  store.dispatch({ type: 'nft/updateNftCollections', payload: data });
};

export const subscribeNftCollections = lazySubscribeMessage(
  'pri(nftCollection.getSubscription)',
  null,
  updateNftCollections,
  updateNftCollections,
);

export const updateStaking = (data: StakingJson) => {
  store.dispatch({ type: 'staking/updateStaking', payload: data.details });
};

/* Staking */

export const subscribeStaking = lazySubscribeMessage(
  'pri(staking.getSubscription)',
  null,
  updateStaking,
  updateStaking,
);

export const updateStakingReward = (data: StakingRewardJson) => {
  store.dispatch({ type: 'staking/updateStakingReward', payload: Object.values(data.data) });
};

export const subscribeStakingReward = lazySubscribeMessage(
  'pri(stakingReward.getSubscription)',
  null,
  updateStakingReward,
  updateStakingReward,
);

export const updateChainStakingMetadata = (data: ChainStakingMetadata[]) => {
  store.dispatch({ type: 'staking/updateChainStakingMetadata', payload: data });
};

export const subscribeChainStakingMetadata = lazySubscribeMessage(
  'pri(bonding.subscribeChainStakingMetadata)',
  null,
  updateChainStakingMetadata,
  updateChainStakingMetadata,
);

export const updateStakingNominatorMetadata = (data: NominatorMetadata[]) => {
  store.dispatch({ type: 'staking/updateNominatorMetadata', payload: data });
};

export const subscribeStakingNominatorMetadata = lazySubscribeMessage(
  'pri(bonding.subscribeNominatorMetadata)',
  null,
  updateStakingNominatorMetadata,
  updateStakingNominatorMetadata,
);

/* Staking */

/* Earning */

export const updateYieldPoolInfo = (data: YieldPoolInfo[]) => {
  addLazy(
    'updateYieldPoolInfo',
    () => {
      store.dispatch({ type: 'earning/updateYieldPoolInfo', payload: data });
    },
    900,
  );
};

export const subscribeYieldPoolInfo = lazySubscribeMessage(
  'pri(yield.subscribePoolInfo)',
  null,
  updateYieldPoolInfo,
  updateYieldPoolInfo,
);

export const updateYieldPositionInfo = (data: YieldPositionInfo[]) => {
  addLazy(
    'updateYieldPositionInfo',
    () => {
      store.dispatch({ type: 'earning/updateYieldPositionInfo', payload: data });
    },
    900,
  );
};

export const subscribeYieldPositionInfo = lazySubscribeMessage(
  'pri(yield.subscribeYieldPosition)',
  null,
  updateYieldPositionInfo,
  updateYieldPositionInfo,
);

export const updateYieldReward = (data: EarningRewardJson) => {
  addLazy(
    'updateYieldReward',
    () => {
      store.dispatch({ type: 'earning/updateYieldReward', payload: Object.values(data.data) });
    },
    900,
  );
};

export const subscribeYieldReward = lazySubscribeMessage(
  'pri(yield.subscribeYieldReward)',
  null,
  updateYieldReward,
  updateYieldReward,
);

export const updateRewardHistory = (data: Record<string, EarningRewardHistoryItem>) => {
  if (Object.keys(data).length > 0) {
    addLazy(
      'updateRewardHistory',
      () => {
        store.dispatch({ type: 'earning/updateRewardHistory', payload: Object.values(data) });
      },
      900,
    );
  }
};

export const subscribeRewardHistory = lazySubscribeMessage(
  'pri(yield.subscribeRewardHistory)',
  null,
  updateRewardHistory,
  updateRewardHistory,
);

export const updateMinAmountPercent = (data: Record<string, number>) => {
  store.dispatch({ type: 'earning/updateMinAmountPercent', payload: data });
};

export const subscribeYieldMinAmountPercent = lazySubscribeMessage(
  'pri(yield.minAmountPercent)',
  null,
  updateMinAmountPercent,
  updateMinAmountPercent,
);

/* Earning */

export const updateTxHistory = (data: TransactionHistoryItem[]) => {
  store.dispatch({ type: 'transactionHistory/update', payload: data });
};

export const subscribeTxHistory = lazySubscribeMessage(
  'pri(transaction.history.getSubscription)',
  null,
  updateTxHistory,
  updateTxHistory,
);

/* Wallet connect */

export const updateConnectWCRequests = (data: WalletConnectSessionRequest[]) => {
  // Convert data to object with key as id
  const requests = convertConfirmationToMap(data);

  store.dispatch({ type: 'requestState/updateConnectWCRequests', payload: requests });
};

export const subscribeConnectWCRequests = lazySubscribeMessage(
  'pri(walletConnect.requests.connect.subscribe)',
  null,
  updateConnectWCRequests,
  updateConnectWCRequests,
);

export const updateWalletConnectSessions = (data: SessionTypes.Struct[]) => {
  const payload: Record<string, SessionTypes.Struct> = {};

  data.forEach(session => {
    payload[session.topic] = session;
  });
  store.dispatch({ type: 'walletConnect/updateSessions', payload: payload });
};

export const subscribeWalletConnectSessions = lazySubscribeMessage(
  'pri(walletConnect.session.subscribe)',
  null,
  updateWalletConnectSessions,
  updateWalletConnectSessions,
);

/* Wallet connect */

/* Campaign */

export const updateBanner = (data: CampaignBanner[]) => {
  const filtered = data.filter(item => !item.isDone);

  store.dispatch({ type: 'campaign/updateBanner', payload: filtered });
};

export const subscribeProcessingCampaign = lazySubscribeMessage(
  'pri(campaign.banner.subscribe)',
  null,
  updateBanner,
  updateBanner,
);

/* Campaign */

export const updateMissionPoolStore = (missions: MissionInfo[]) => {
  store.dispatch({
    type: 'missionPool/update',
    payload: {
      missions,
    },
  });
};

const handleError = () => {
  try {
    const backupData = JSON.parse(mmkvStore.getString('mission-pools') || '{}');
    updateMissionPoolStore(backupData as MissionInfo[]);
  } catch (e) {
    console.error(e);
  }
};

export const getMissionPoolData = (() => {
  const dataByDevModeStatus = getStaticContentByDevMode();
  const handler: {
    resolve?: (value: unknown[]) => void;
    reject?: (reason?: any) => void;
  } = {};

  const promise = new Promise<any[]>((resolve, reject) => {
    handler.resolve = resolve;
    handler.reject = reject;
  });

  const rs = {
    promise,
    start: () => {
      fetchStaticData<MissionInfo[]>('airdrop-campaigns', dataByDevModeStatus)
        .then(data => {
          handler.resolve?.(data);
        })
        .catch(handler.reject);
    },
  };

  rs.promise
    .then(data => {
      updateMissionPoolStore(data as MissionInfo[]);
      mmkvStore.set('mission-pools', JSON.stringify(data));
    })
    .catch(handleError);

  return rs;
})();

/* Buy service */

export const updateBuyTokens = (data: Record<string, BuyTokenInfo>) => {
  store.dispatch({ type: 'buyService/updateBuyTokens', payload: data });
};

export const subscribeBuyTokens = lazySubscribeMessage(
  'pri(buyService.tokens.subscribe)',
  null,
  updateBuyTokens,
  updateBuyTokens,
);

export const updateBuyServices = (data: Record<string, BuyServiceInfo>) => {
  store.dispatch({ type: 'buyService/updateBuyServices', payload: data });
};

export const subscribeBuyServices = lazySubscribeMessage(
  'pri(buyService.services.subscribe)',
  null,
  updateBuyServices,
  updateBuyServices,
);

/* Swap */
export const updateSwapPairs = (data: SwapPair[]) => {
  store.dispatch({ type: 'swap/updateSwapPairs', payload: data });
};

export const subscribeSwapPairs = lazySubscribeMessage(
  'pri(swapService.subscribePairs)',
  null,
  updateSwapPairs,
  updateSwapPairs,
);

/* Ledger */
export const updateLedgerGenericAllowNetworks = (data: string[]) => {
  store.dispatch({ type: 'chainStore/updateLedgerGenericAllowNetworks', payload: data });
};

export const subscribeLedgerGenericAllowNetworks = lazySubscribeMessage(
  'pri(ledger.generic.allow)',
  null,
  updateLedgerGenericAllowNetworks,
  updateLedgerGenericAllowNetworks,
);
/* Ledger */

export const updateCampaignPopupData = (data: AppPopupData[]) => {
  store.dispatch({ type: 'staticContent/updateAppPopupData', payload: data });
};

export const updateCampaignBannerData = (data: AppBannerData[]) => {
  store.dispatch({ type: 'staticContent/updateAppBannerData', payload: data });
};

export const updateCampaignConfirmationData = (data: AppConfirmationData[]) => {
  store.dispatch({ type: 'staticContent/updateAppConfirmationData', payload: data });
};

export const subscribeCampaignPopupData = lazySubscribeMessage(
  'pri(campaign.popups.subscribe)',
  null,
  updateCampaignPopupData,
  updateCampaignPopupData,
);

export const subscribeCampaignBannerData = lazySubscribeMessage(
  'pri(campaign.banners.subscribe)',
  null,
  updateCampaignBannerData,
  updateCampaignBannerData,
);

export const subscribeCampaignConfirmationData = lazySubscribeMessage(
  'pri(campaign.confirmations.subscribe)',
  null,
  updateCampaignConfirmationData,
  updateCampaignConfirmationData,
);
/* Swap */

/* Buy service */

// export const updateChainValidators = (data: ChainValidatorParams) => {
//   store.dispatch({ type: 'bonding/updateChainValidators', payload: data });
// };
//
// export const subscribeChainValidators = lazySubscribeMessage('pri(bonding.getBondingOptions)', null, updateChainValidators, updateChainValidators);
/* Notification service */
export const updateUnreadNotificationCountMap = (data: Record<string, number>) => {
  store.dispatch({ type: 'notification/updateUnreadNotificationCountMap', payload: data });
};

export const subscribeUnreadNotificationCount = lazySubscribeMessage(
  'pri(inappNotification.subscribeUnreadNotificationCountMap)',
  null,
  updateUnreadNotificationCountMap,
  updateUnreadNotificationCountMap,
);
/* Notification service */

/* Priority tokens */
export const updatePriorityTokens = (data: TokenPriorityDetails) => {
  store.dispatch({ type: 'chainStore/updatePriorityTokens', payload: data });
};

export const subscribePriorityTokens = lazySubscribeMessage(
  'pri(tokens.subscribePriority)',
  null,
  updatePriorityTokens,
  updatePriorityTokens,
);
/* Priority tokens */

/* Process multi steps */
export const updateAliveProcess = (data: ResponseSubscribeProcessAlive) => {
  store.dispatch({ type: 'requestState/updateAliveProcess', payload: data.processes });
};

export const subscribeAliveProcess = lazySubscribeMessage(
  'pri(process.subscribe.alive)',
  null,
  updateAliveProcess,
  updateAliveProcess,
);
/* Process multi steps */
