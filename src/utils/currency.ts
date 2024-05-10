// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurrencyDollar, CurrencyEur, CurrencyGbp, CurrencyJpy, CurrencyRub } from 'phosphor-react-native';
import React from 'react';
import { IconProps } from 'phosphor-react-native';

export interface CurrencySymbol {
  icon: React.ElementType<IconProps> | string;
}
export enum CurrencyType {
  USD = 'USD',
  BRL = 'BRL',
  CNY = 'CNY',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  HKD = 'HKD',
  VND = 'VND',
  RUB = 'RUB',
}

// todo: About label, will convert to key for i18n later
export const getCurrencySymbol = (key: string): CurrencySymbol => {
  switch (key) {
    case CurrencyType.USD:
      return { icon: CurrencyDollar as React.ElementType<IconProps> };
    case CurrencyType.BRL:
      return { icon: CurrencyType.BRL };
    case CurrencyType.CNY:
      return { icon: CurrencyType.CNY };
    case CurrencyType.EUR:
      return { icon: CurrencyEur as React.ElementType<IconProps> };
    case CurrencyType.GBP:
      return { icon: CurrencyGbp as React.ElementType<IconProps> };
    case CurrencyType.JPY:
      return { icon: CurrencyJpy as React.ElementType<IconProps> };
    case CurrencyType.HKD:
      return { icon: CurrencyType.HKD };
    case CurrencyType.VND:
      return { icon: CurrencyType.VND };
    case CurrencyType.RUB:
      return { icon: CurrencyRub as React.ElementType<IconProps> };
    default:
      throw new Error(`Unknown currency type: ${key}`);
  }
};
