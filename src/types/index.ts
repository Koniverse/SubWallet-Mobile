import BigN from 'bignumber.js';
import { BalanceItem } from '@subwallet/extension-base/types';

export interface WebViewMessageBase<T> {
  id: string;
  method: string;
  payload: T;
}

export interface WebViewMessageRequest<T> extends WebViewMessageBase<T> {
  isSubscribe?: boolean;
}

export interface WebViewMessageResponse<T> extends WebViewMessageRequest<T> {}

export type AccountInfoItem = {
  networkKey: string;
  tokenDecimals: number[];
  tokenSymbols: string[];
  balanceItem: BalanceItem;
};

export type BalanceSubInfo = {
  key: string;
  label: string;
  symbol: string;
  displayedSymbol: string;
  balanceValue: BigN;
  convertedBalanceValue: BigN;
};

export type BalanceInfo = {
  symbol: string;
  displayedSymbol: string;
  balanceValue: BigN;
  convertedBalanceValue: BigN;
  detailBalances: BalanceSubInfo[];
  childrenBalances: BalanceSubInfo[];
  isReady: boolean;
};

export enum AccountAddressType {
  ETHEREUM = 'ethereum',
  SUBSTRATE = 'substrate',
  ALL = 'all',
  UNKNOWN = 'unknown',
}

export type ChainInfo = {
  slug: string;
  name: string;
};

// follow the counterpart name in source code of extension
export type ChainItemType = ChainInfo;

export type VoidFunction = () => void;
