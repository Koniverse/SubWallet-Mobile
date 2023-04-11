import BigN from 'bignumber.js';
import { BalanceItem, CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';

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

export type CrowdloanItemType = {
  slug: string;
  contribute: string | BigN;
  convertedContribute: string | BigN;
  chainDisplayName: string;
  relayParentDisplayName: string;
  symbol: string;
  paraState?: CrowdloanParaState;
  crowdloanUrl?: string;
};

export enum AccountAddressType {
  ETHEREUM = 'ethereum',
  SUBSTRATE = 'substrate',
  ALL = 'all',
  UNKNOWN = 'unknown',
}

export enum AccountSignMode {
  PASSWORD = 'password',
  QR = 'qr',
  LEDGER = 'ledger',
  READ_ONLY = 'readonly',
  ALL_ACCOUNT = 'all',
  UNKNOWN = 'unknown'
}

export type ChainInfo = {
  slug: string;
  name: string;
};
