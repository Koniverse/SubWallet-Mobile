import BigN from 'bignumber.js';
import { BalanceInfo } from '../types';
import { TokenBalanceItemType } from 'types/ui-types';

export type AccountBalanceType = {
  totalBalanceValue: BigN;
  networkBalanceMap: Record<string, BalanceInfo>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
};
