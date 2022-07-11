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

export interface BalanceContainerType {
  balanceValue: BigN;
  accountButtonContainerStyle?: StyleProp<any>;
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
};

export type AccountActionType = {
  icon: ({ weight, color, size, style, mirrored }: IconProps) => JSX.Element;
  title: string;
  onCLickButton: () => void;
};
