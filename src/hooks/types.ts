import BigN from 'bignumber.js';
import { BalanceInfo } from '../types';

export type AccountBalanceType = {
  totalBalanceValue: BigN;
  networkBalanceMaps: Record<string, BalanceInfo>;
};
