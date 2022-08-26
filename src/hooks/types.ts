import BigN from 'bignumber.js';
import { BalanceInfo } from '../types';
import { TokenBalanceItemType } from 'types/ui-types';
import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceValueType } from 'utils/chainBalances';

export type AccountBalanceType = {
  totalBalanceValue: BigN;
  networkBalanceMap: Record<string, BalanceInfo>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
};

export type CrowdloanContributeValueType = {
  paraState?: CrowdloanParaState;
  contribute: BalanceValueType;
};
