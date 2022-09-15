import BigN from 'bignumber.js';
import {
  BalanceItem,
  CrowdloanParaState,
  NftCollection,
  NftItem,
} from '@subwallet/extension-base/background/KoniTypes';

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
  networkKey: string;
  contribute: string | BigN;
  contributeToUsd: string | BigN;
  networkDisplayName: string;
  groupDisplayName: string;
  logo: string;
  symbol: string;
  paraState?: CrowdloanParaState;
  crowdloanUrl?: string;
};

export interface NftScreenState {
  title: string;
  screen: 'CollectionList' | 'Collection' | 'NFT';
  collection?: NftCollection;
  nft?: NftItem;
}

export interface NftScreenActionParams {
  type: string;
  payload: Partial<NftScreenState>;
}
