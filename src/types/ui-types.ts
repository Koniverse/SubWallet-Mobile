import { AccountJson } from '@subwallet/extension-base/background/types';
import React from 'react';
import { IconProps } from 'phosphor-react-native';
import BigN from 'bignumber.js';
import { StyleProp } from 'react-native';

export type BalanceFormatType = [number, string, string | undefined];
export type BitLength = 8 | 16 | 32 | 64 | 128 | 256;
export interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
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

export interface BalanceContainerType {
  balanceValue: BigN;
  amountToUsd?: BigN;
  isShowBalanceToUsd?: boolean;
  startWithSymbol?: boolean;
  symbol?: string;
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
};

export type AccountActionType = {
  icon: ({ weight, color, size, style, mirrored }: IconProps) => JSX.Element;
  title: string;
  onCLickButton: () => void;
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

export interface TokenBalanceItemType {
  id: string;
  logoKey: string;
  networkKey: string;
  networkDisplayName?: string;
  balanceValue: BigN;
  convertedBalanceValue: BigN;
  symbol: string;
  displayedSymbol: string;
  isReady: boolean;
  isTestnet: boolean;
  priceValue: number;
}

export interface UseViewStepType {
  currentView: string;
  toNextView: (view: string) => void;
  toBack: () => void;
}
