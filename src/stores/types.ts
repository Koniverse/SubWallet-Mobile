import {
  ActiveCronAndSubscriptionMap,
  AddressBookState,
  AssetSetting,
  CampaignBanner,
  ChainStakingMetadata,
  ConfirmationDefinitions,
  ConfirmationsQueue,
  ConfirmationsQueueBitcoin,
  ConfirmationsQueueCardano,
  ConfirmationsQueueTon,
  ConfirmationType,
  CrowdloanItem,
  KeyringState,
  MantaPayConfig,
  NftCollection,
  NftItem,
  NominatorMetadata,
  PriceJson,
  StakingItem,
  StakingRewardItem,
  TokenPriorityDetails,
  TransactionHistoryItem,
  UiSettings,
  ValidatorInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import {
  AccountsContext,
  AuthorizeRequest,
  MetadataRequest,
  SigningRequest,
} from '@subwallet/extension-base/background/types';
import { SettingsStruct } from '@polkadot/ui-settings/types';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { _AssetRef, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { _ChainApiStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import {
  AccountJson,
  AccountProxy,
  BalanceMap,
  BuyServiceInfo,
  BuyTokenInfo,
  EarningRewardHistoryItem,
  EarningRewardItem,
  NominationPoolInfo,
  ProcessTransactionData,
  YieldPoolInfo,
  YieldPoolTarget,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { SessionTypes } from '@walletconnect/types';
import {
  WalletConnectNotSupportRequest,
  WalletConnectSessionRequest,
} from '@subwallet/extension-base/services/wallet-connect-service/types';
import { MissionInfo } from 'types/missionPool';
import { DAppCategory, DAppInfo } from 'types/browser';
import { RootRouteProps } from 'routes/index';
import { MktCampaignHistoryData } from 'types/staticContent';
import { SwapPair } from '@subwallet/extension-base/types/swap';
import {
  AppBannerData,
  AppConfirmationData,
  AppPopupData,
} from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { AuthUrlInfo } from '@subwallet/extension-base/services/request-service/types';

export type StoreStatus = 'INIT' | 'CACHED' | 'SYNCED' | 'WAITING';

export type StoreSlice = {
  isReady?: boolean;
};

export type AccountsSlice = {
  accounts: AccountJson[];
  currentAccountAddress: string;
  currentAccount?: AccountJson;
  isWaiting?: boolean;
} & StoreSlice;

export type AppStateSlice = {
  isLocked: boolean;
  isDisplayConfirmation: boolean;
  isDisplayMktCampaign: boolean;
};

export type AppVersionSlice = {
  buildNumber: number;
};

export type SelectedActionType = 'createAcc' | 'importAcc' | 'attachAcc' | 'migratePassword';

export type PasswordModalSlice = {
  isShowModal: boolean;
  selectedAction?: SelectedActionType;
};

export type AuthUrlsSlice = {
  details: Record<string, AuthUrlInfo>;
} & StoreSlice;

export type ConfirmationSlice = {
  details: {
    authorizeRequest?: Record<string, AuthorizeRequest>;
    signingRequest?: Record<string, SigningRequest>;
    metadataRequest?: Record<string, MetadataRequest>;
  } & {
    [P in keyof ConfirmationsQueue]?: ConfirmationsQueue[P];
  };
} & StoreSlice;

export type MobileSettingsSlice = {
  language: string;
  pinCodeEnabled: boolean;
  faceIdEnabled: boolean; // deprecated
  isUseBiometric: boolean;
  timeAutoLock: LockTimeout;
  isPreventLock: boolean;
};

export enum LockTimeout {
  NEVER = -1,
  ALWAYS = 0,
  _1MINUTE = 1,
  _5MINUTE = 5,
  _10MINUTE = 10,
  _15MINUTE = 15,
  _30MINUTE = 30,
  _60MINUTE = 60,
}

export type SiteInfo = {
  name: string;
  url: string;
};

export type StoredSiteInfo = {
  id: string;
} & SiteInfo;

export type BrowserSliceTab = {
  id: string;
  url: string;
  screenshot?: string;
};

export type BrowserSlice = {
  activeTab: null | string;
  tabs: BrowserSliceTab[];
  whitelist: string[];
  history: StoredSiteInfo[];
  bookmarks: StoredSiteInfo[];
  defaultDesktopMode: string[];
  desktopMode: string[];
  externalApplicationUrlList: string[];
};

export type BackgroundServiceSlice = {
  activeState: ActiveCronAndSubscriptionMap;
};

export enum ReduxStatus {
  INIT = 'init',
  CACHED = 'cached',
  READY = 'ready',
}
export interface BaseReduxStore {
  reduxStatus: ReduxStatus;
}

export interface AppSettings extends UiSettings, Omit<SettingsStruct, 'camera' | 'notification'>, BaseReduxStore {
  authUrls: Record<string, AuthUrlInfo>;
  mediaAllowed: boolean;
  isDeepLinkConnect: boolean;
  isShowBuyToken: boolean;
  browserDApps: {
    dApps: DAppInfo[] | undefined;
    dAppCategories: DAppCategory[] | undefined;
  };
  currentRoute: RootRouteProps | undefined;
}

export interface AppOnlineContent {
  appPopupData: AppPopupData[];
  appBannerData: AppBannerData[];
  appConfirmationData: AppConfirmationData[];
  popupHistoryMap: Record<string, MktCampaignHistoryData>;
  bannerHistoryMap: Record<string, MktCampaignHistoryData>;
  confirmationHistoryMap: Record<string, MktCampaignHistoryData>;
}

export interface AccountState extends AccountsContext, KeyringState, AddressBookState, BaseReduxStore {
  currentAccount: AccountJson | null;
  currentAccountProxy: AccountProxy | null;
  accountProxies: AccountProxy[];
  isNoAccount: boolean;
  isAllAccount: boolean;
}

export interface RequestState
  extends ConfirmationsQueue,
    ConfirmationsQueueTon,
    ConfirmationsQueueCardano,
    ConfirmationsQueueBitcoin,
    BaseReduxStore {
  authorizeRequest: Record<string, AuthorizeRequest>;
  metadataRequest: Record<string, MetadataRequest>;
  signingRequest: Record<string, SigningRequest>;
  hasConfirmations: boolean;
  hasInternalConfirmations: boolean;
  aliveProcess: Record<string, ProcessTransactionData>;
  numberOfConfirmations: number;
  transactionRequest: Record<string, SWTransactionResult>;
  connectWCRequest: Record<string, WalletConnectSessionRequest>;
  notSupportWCRequest: Record<string, WalletConnectNotSupportRequest>;
}

export interface UpdateConfirmationsQueueRequest extends BaseReduxStore {
  type: ConfirmationType;
  data: Record<string, ConfirmationDefinitions[ConfirmationType][0]>;
}

export interface AssetRegistryStore extends BaseReduxStore {
  assetRegistry: Record<string, _ChainAsset>;
  multiChainAssetMap: Record<string, _MultiChainAsset>;
  assetSettingMap: Record<string, AssetSetting>;
  xcmRefMap: Record<string, _AssetRef>;
}

export interface ChainStore extends BaseReduxStore {
  chainInfoMap: Record<string, _ChainInfo>;
  chainStateMap: Record<string, _ChainState>;
  chainStatusMap: Record<string, _ChainApiStatus>;
  ledgerGenericAllowNetworks: string[];
  priorityTokens: TokenPriorityDetails;
  chainOldPrefixMap: Record<string, number>;
}

export interface BalanceStore extends BaseReduxStore {
  balanceMap: BalanceMap;
}

export interface CampaignStore extends BaseReduxStore {
  banners: CampaignBanner[];
}

export type PriceStore = PriceJson;

export interface CrowdloanStore extends BaseReduxStore {
  crowdloanMap: Record<string, CrowdloanItem>;
}

export interface NftStore extends BaseReduxStore {
  nftItems: NftItem[];
  nftCollections: NftCollection[];
}

export interface StakingStore extends BaseReduxStore {
  stakingMap: StakingItem[];
  stakingRewardMap: StakingRewardItem[];
  chainStakingMetadataList: ChainStakingMetadata[];
  nominatorMetadataList: NominatorMetadata[];
}

export interface BondingStore extends BaseReduxStore {
  nominationPoolInfoMap: Record<string, NominationPoolInfo[]>;
  validatorInfoMap: Record<string, ValidatorInfo[]>;
}

export interface ChainValidatorParams {
  chain: string;
  validators: ValidatorInfo[];
}

export interface ChainNominationPoolParams {
  chain: string;
  pools: NominationPoolInfo[];
}

export type TransactionHistoryReducerType = {
  historyList: TransactionHistoryItem[];
};

export interface WalletConnectStore extends BaseReduxStore {
  sessions: Record<string, SessionTypes.Struct>;
}

export interface MissionPoolStore extends BaseReduxStore {
  missions: MissionInfo[];
}

export interface BuyServiceStore extends BaseReduxStore {
  tokens: Record<string, BuyTokenInfo>;
  services: Record<string, BuyServiceInfo>;
}

export interface EarningStore extends BaseReduxStore {
  poolInfoMap: Record<string, YieldPoolInfo>;
  yieldPositions: YieldPositionInfo[];
  earningRewards: EarningRewardItem[];
  rewardHistories: EarningRewardHistoryItem[];
  minAmountPercentMap: Record<string, number>;
  poolTargetsMap: Record<string, YieldPoolTarget[]>;
}

export interface SwapStore extends BaseReduxStore {
  swapPairs: SwapPair[];
}

export interface MantaPayStore {
  configs: MantaPayConfig[];
  isSyncing: boolean;
  progress: number;
  needManualSync?: boolean;
  reduxStatus: ReduxStatus;
}

export interface NotificationStore extends BaseReduxStore {
  unreadNotificationCountMap: Record<string, number>;
}
