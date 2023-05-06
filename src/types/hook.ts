import BigN from 'bignumber.js';
import { PriceChangeStatus, TokenBalanceItemType } from 'types/balance';

export type TokenGroupHookType = {
  tokenGroupMap: Record<string, string[]>;
  sortedTokenGroups: string[];
  sortedTokenSlugs: string[];
  isComputing?: boolean;
};

export type AccountBalanceHookType = {
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  tokenGroupBalanceMap: Record<string, TokenBalanceItemType>;
  totalBalanceInfo: {
    convertedValue: BigN;
    converted24hValue: BigN;
    change: {
      value: BigN;
      status?: PriceChangeStatus;
      percent: BigN;
    };
  };
  isComputing?: boolean;
};
