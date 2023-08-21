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

export type CrowdloanValueInfo = {
  value: BigN;
  convertedValue: BigN;
  symbol: string;
};

export type CrowdloanContributeValueType = {
  paraState?: CrowdloanParaState;
  contribute: CrowdloanValueInfo;
};

export type CrowdloanItemType = {
  slug: string;
  contribute: string | BigN;
  convertedContribute: string | BigN;
  chainDisplayName: string;
  relayParentDisplayName: string;
  symbol: string;
  paraState?: CrowdloanParaState;
  crowdloanUrl?: string | null;
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
