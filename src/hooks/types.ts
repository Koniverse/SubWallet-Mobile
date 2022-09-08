import BigN from 'bignumber.js';
import { BalanceInfo } from '../types';
import { TokenBalanceItemType } from 'types/ui-types';
import { CrowdloanParaState } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceValueType } from 'utils/chainBalances';
import { ConfirmationSlice } from 'stores/types';

export type AccountBalanceType = {
  totalBalanceValue: BigN;
  networkBalanceMap: Record<string, BalanceInfo>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
};

export type CrowdloanContributeValueType = {
  paraState?: CrowdloanParaState;
  contribute: BalanceValueType;
};

export type ConfirmationType = keyof ConfirmationSlice['details'];

export type ConfirmationHookType = {
  confirmationRequestMap: ConfirmationSlice['details'];
  cancelRequest: (type: ConfirmationType, id: string) => Promise<void>;
  approveRequest: (type: ConfirmationType, id: string, payload: unknown) => Promise<void>;
  rejectRequest: (type: ConfirmationType, id: string) => Promise<void>;
  isEmptyRequests: boolean;
};
