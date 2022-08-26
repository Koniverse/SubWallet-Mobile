import {
  BalanceJson,
  ChainRegistry,
  CrowdloanJson,
  NetworkJson,
  PriceJson,
  ResponseSettingsType,
  TransactionHistoryItemType,
} from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';

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
