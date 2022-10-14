import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';

export interface ConfirmUnStakeState {
  delegations?: DelegationItem[];
  nominatedAmount: string;
  minBond: string;
  selectedDelegation: string;
  isDataReady: boolean;
  isValidValidator: boolean;
}

export const DEFAULT_CONFIRM_UN_STAKE_STATE: ConfirmUnStakeState = {
  delegations: undefined,
  selectedDelegation: '',
  nominatedAmount: '0',
  isDataReady: false,
  isValidValidator: true,
  minBond: '0',
};

export enum ConfirmUnStakeActionName {
  CHANGE_DELEGATIONS = 'CHANGE_DELEGATIONS',
  REFRESH_DELEGATIONS = 'REFRESH_DELEGATIONS',
  SELECT_DELEGATION = 'SELECT_DELEGATION',
}

interface AbstractConfirmUnStakeAction {
  type: ConfirmUnStakeActionName;
  payload: Partial<ConfirmUnStakeState> | null;
}

export interface ConfirmUnStakeChangeDelegationsAction extends AbstractConfirmUnStakeAction {
  type: ConfirmUnStakeActionName.CHANGE_DELEGATIONS;
  payload: ConfirmUnStakeState | Pick<ConfirmUnStakeState, 'isDataReady'>;
}

export interface ConfirmUnStakeRefreshDelegationsAction extends AbstractConfirmUnStakeAction {
  type: ConfirmUnStakeActionName.REFRESH_DELEGATIONS;
  payload: null;
}

export interface ConfirmUnStakeSelectDelegationAction extends AbstractConfirmUnStakeAction {
  type: ConfirmUnStakeActionName.SELECT_DELEGATION;
  payload: {
    selectedDelegation: string;
  };
}

export type ConfirmUnStakeAction =
  | ConfirmUnStakeChangeDelegationsAction
  | ConfirmUnStakeRefreshDelegationsAction
  | ConfirmUnStakeSelectDelegationAction;

const handleChangeDelegationsAction = (
  state: ConfirmUnStakeState,
  { payload }: ConfirmUnStakeChangeDelegationsAction,
): ConfirmUnStakeState => {
  return {
    ...DEFAULT_CONFIRM_UN_STAKE_STATE,
    ...payload,
  };
};

const handleRefreshDelegationsAction = (state: ConfirmUnStakeState): ConfirmUnStakeState => {
  return {
    ...state,
    delegations: undefined,
    isDataReady: false,
  };
};

const handleSelectDelegationAction = (
  state: ConfirmUnStakeState,
  { payload }: ConfirmUnStakeSelectDelegationAction,
): ConfirmUnStakeState => {
  const selected = state.delegations?.find(item => item.owner === payload.selectedDelegation);
  if (selected) {
    return {
      ...state,
      selectedDelegation: selected.owner,
      nominatedAmount: selected.amount,
      minBond: selected.minBond,
      isValidValidator: !selected.hasScheduledRequest,
    };
  } else {
    return { ...state };
  }
};

export const confirmUnStakeReducer = (
  state: ConfirmUnStakeState,
  action: ConfirmUnStakeAction,
): ConfirmUnStakeState => {
  const { type } = action;
  switch (type) {
    case ConfirmUnStakeActionName.CHANGE_DELEGATIONS:
      return handleChangeDelegationsAction(state, action);
    case ConfirmUnStakeActionName.REFRESH_DELEGATIONS:
      return handleRefreshDelegationsAction(state);
    case ConfirmUnStakeActionName.SELECT_DELEGATION:
      return handleSelectDelegationAction(state, action);
    default:
      throw new Error('');
  }
};
