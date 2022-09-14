import {
  BalanceJson,
  ChainRegistry,
  ConfirmationsQueue,
  CrowdloanJson,
  NetworkJson,
  PriceJson,
  NftJson,
  ResponseSettingsType,
  TransactionHistoryItemType,
  NftCollectionJson,
  NftItem,
} from '@subwallet/extension-base/background/KoniTypes';
import {
  AccountJson,
  AuthorizeRequest,
  MetadataRequest,
  SigningRequest,
} from '@subwallet/extension-base/background/types';

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
};

export type BalanceSlice = BalanceJson & StoreSlice;
export type CrowdloanSlice = CrowdloanJson & StoreSlice;

export type ChainRegistrySlice = {
  details: Record<string, ChainRegistry>;
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
  pinCode: string;
  pinCodeEnabled: boolean;
  faceIdEnabled: boolean;
  autoLockTime: number | undefined;
};

export type NetworkMapSlice = {
  details: Record<string, NetworkJson>;
} & StoreSlice;

export type PriceSlice = Omit<PriceJson, 'ready'> & StoreSlice;

export type SettingsSlice = ResponseSettingsType & StoreSlice;

export type TransactionHistorySlice = {
  details: Record<string, TransactionHistoryItemType[]>;
} & StoreSlice;

export type NftSlice = NftJson & StoreSlice;

export type NftCollectionSlice = NftCollectionJson & StoreSlice;

export type TransferNftParams = {
  nftItem: NftItem;
  collectionImage?: string;
  collectionId: string;
};

export type TransferNftParamsSlice = TransferNftParams & StoreSlice;
