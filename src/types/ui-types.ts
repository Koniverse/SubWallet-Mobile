import { AccountJson } from '@subwallet/extension-base/background/types';
import React from 'react';
import { Icon, IconProps } from 'phosphor-react-native';
import BigN from 'bignumber.js';

export type AccountType = 'ALL' | 'ETHEREUM' | 'SUBSTRATE';
export type BalanceFormatType = [number, string, string | undefined];
export type BitLength = 8 | 16 | 32 | 64 | 128 | 256;
export interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  originGenesisHash?: string | null;
  prefix?: number;
  isEthereum: boolean;
}

export interface CheckBoxesType {
  value: string;
  labelComponent: React.ReactNode;
}

export interface SelectionProviderType {
  selectedNetworkKey: string;
  selectedToken?: string;
}

export interface SelectionProviderProps {
  selectionProvider?: SelectionProviderType;
}

export interface BalanceBlockType {
  totalValue: BigN;
  totalChangeValue: BigN;
  totalChangePercent: BigN;
  isPriceDecrease: boolean;
  // isShrink: boolean;
  // onOpenSendFund: () => void;
  // onOpenBuyTokens: () => void;
  // onOpenReceive: () => void;
  // balanceValue: BigN;
  // amountToUsd?: BigN;
  // isShowBalanceToUsd?: boolean;
  // startWithSymbol?: boolean;
  // symbol?: string;
}

export type AccountInfoByNetwork = {
  key: string;
  networkKey: string;
  networkDisplayName: string;
  networkPrefix: number;
  networkLogo: string;
  networkIconTheme: string;
  address: string;
  formattedAddress: string;
  isTestnet: boolean;
  nativeToken?: string;
};

export type AccountActionType = {
  icon: ({ weight, color, size, style, mirrored }: IconProps) => JSX.Element;
  title: string;
  onCLickButton: () => void;
};

export type AccountActionGroup = {
  title: string;
  items: AccountActionType[];
  key: string;
};

export interface TokenItemType {
  networkKey: string;
  networkDisplayName: string;
  symbol: string;
  displayedSymbol: string;
  decimals: number;
  isMainToken: boolean;
  specialOption?: object;
}

export interface UseViewStepType {
  currentView: string;
  views: string[];
  toNextView: (view: string) => void;
  toBack: () => void;
}

export type FilterOptsType = Record<string, string>;

export type SortFunctionInterface<T> = (a: T, b: T) => number;

export interface AvatarSubIcon {
  Icon: Icon;
  size: number;
}
