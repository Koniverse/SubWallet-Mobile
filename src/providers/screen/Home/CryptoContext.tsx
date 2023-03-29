import BigN from 'bignumber.js';
import React from 'react';
import { CryptoContextType } from 'types/context';

export const CryptoContext = React.createContext<CryptoContextType>({
  accountBalance: {
    tokenBalanceMap: {},
    tokenGroupBalanceMap: {},
    totalBalanceInfo: {
      convertedValue: new BigN(0),
      converted24hValue: new BigN(0),
      change: {
        value: new BigN(0),
        percent: new BigN(0),
      },
    },
  },
  tokenGroupStructure: {
    tokenGroupMap: {},
    sortedTokenGroups: [],
    sortedTokenSlugs: [],
  },
});
