import {
  BalanceJson,
  ChainRegistry,
  NetworkJson,
  PriceJson,
  ResponseSettingsType,
  TransactionHistoryItemType,
} from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';

export type StoreSlice = {
  isReady?: boolean;
};

export type AccountsSlice = {
  accounts: AccountJson[];
  currentAccountAddress: string;
  currentAccount?: AccountJson;
} & StoreSlice;

export type BalanceSlice = BalanceJson & StoreSlice;

export type ChainRegistrySlice = {
  details: Record<string, ChainRegistry>;
} & StoreSlice;

export type MobileSettingsSlice = {
  language: string;
  pinCode: string;
  pinCodeEnabled: boolean;
  autoLockTime: number | undefined;
} & StoreSlice;

export type NetworkMapSlice = {
  details: Record<string, NetworkJson>;
} & StoreSlice;

export type PriceSlice = Omit<PriceJson, 'ready'> & StoreSlice;

export type SettingsSlice = ResponseSettingsType & StoreSlice;

export type TransactionHistorySlice = {
  details: Record<string, TransactionHistoryItemType[]>;
} & StoreSlice;
