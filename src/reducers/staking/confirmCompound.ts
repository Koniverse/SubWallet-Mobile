import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

// Existing request state
export interface ExistingRequestState {
  hasCompoundRequest: boolean;
  currentTaskId: string;
  currentFrequency: number;
  currentAccountMinimum: number;
  isCompoundReady: boolean;
}

// Delegation state
export interface DelegationState {
  delegations?: DelegationItem[];
  nominatedAmount: string;
  selectedDelegation: string;
  isDelegationReady: boolean;
}

// Compound state
export interface CompoundState {
  accountMinimum: string;
  isReadySubmit: boolean;
  warningMessage: string;
}

export type ConfirmCompoundState = ExistingRequestState & DelegationState & CompoundState;

const TURING_ED = 0.01;

const DEFAULT_EXISTING_REQUEST_STATE: ExistingRequestState = {
  currentAccountMinimum: -1,
  currentFrequency: -1,
  currentTaskId: '',
  hasCompoundRequest: false,
  isCompoundReady: false,
};

const DEFAULT_DELEGATION_STATE: DelegationState = {
  delegations: undefined,
  selectedDelegation: '',
  nominatedAmount: '0',
  isDelegationReady: false,
};

const DEFAULT_COMPOUND_STATE: CompoundState = {
  accountMinimum: '0',
  isReadySubmit: false,
  warningMessage: '',
};

export const DEFAULT_CONFIRM_COMPOUND_STATE: ConfirmCompoundState = {
  ...DEFAULT_EXISTING_REQUEST_STATE,
  ...DEFAULT_DELEGATION_STATE,
  ...DEFAULT_COMPOUND_STATE,
};

export enum ConfirmCompoundActionName {
  CHANGE_DELEGATIONS = 'CHANGE_DELEGATIONS',
  REFRESH_DELEGATIONS = 'REFRESH_DELEGATIONS',
  SELECT_DELEGATION = 'SELECT_DELEGATION',
  CHANGE_EXISTING_REQUEST = 'CHANGE_EXISTING_REQUEST',
  REFRESH_EXISTING_REQUEST = 'REFRESH_EXISTING_REQUEST',
  CHANGE_COMPOUND_VALUE = 'CHANGE_COMPOUND_VALUE',
}

interface AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName;
  payload: Partial<ConfirmCompoundState> | null;
}

export interface ConfirmCompoundChangeDelegationsAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.CHANGE_DELEGATIONS;
  payload: DelegationState;
}

export interface ConfirmCompoundRefreshDelegationsAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.REFRESH_DELEGATIONS;
  payload: null;
}

export interface ConfirmCompoundSelectDelegationAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.SELECT_DELEGATION;
  payload: {
    selectedDelegation: string;
  };
}

export interface ConfirmCompoundChangeExistingRequestAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.CHANGE_EXISTING_REQUEST;
  payload: ExistingRequestState;
}

export interface ConfirmCompoundRefreshExistingRequestAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.REFRESH_EXISTING_REQUEST;
  payload: null;
}

export interface ConfirmCompoundChangeCompoundValueAction extends AbstractConfirmCompoundAction {
  type: ConfirmCompoundActionName.CHANGE_COMPOUND_VALUE;
  payload: {
    accountMinimum: string;
    decimals: number;
  };
}

export type ConfirmCompoundAction =
  | ConfirmCompoundChangeDelegationsAction
  | ConfirmCompoundRefreshDelegationsAction
  | ConfirmCompoundSelectDelegationAction
  | ConfirmCompoundChangeExistingRequestAction
  | ConfirmCompoundRefreshExistingRequestAction
  | ConfirmCompoundChangeCompoundValueAction;

const handleChangeDelegationsAction = (
  state: ConfirmCompoundState,
  { payload }: ConfirmCompoundChangeDelegationsAction,
): ConfirmCompoundState => {
  return {
    ...state,
    ...payload,
  };
};

const handleRefreshDelegationsAction = (state: ConfirmCompoundState): ConfirmCompoundState => {
  return {
    ...state,
    ...DEFAULT_DELEGATION_STATE,
  };
};

const handleSelectDelegationAction = (
  state: ConfirmCompoundState,
  { payload }: ConfirmCompoundSelectDelegationAction,
): ConfirmCompoundState => {
  const selected = state.delegations?.find(item => item.owner === payload.selectedDelegation);
  if (selected) {
    return {
      ...state,
      selectedDelegation: selected.owner,
      nominatedAmount: selected.amount,
      accountMinimum: '0',
      warningMessage: '',
    };
  } else {
    return { ...state };
  }
};

const handleChangeExistingRequestAction = (
  state: ConfirmCompoundState,
  { payload }: ConfirmCompoundChangeExistingRequestAction,
): ConfirmCompoundState => {
  return {
    ...state,
    ...payload,
  };
};

const handleRefreshExistingRequestAction = (state: ConfirmCompoundState): ConfirmCompoundState => {
  return {
    ...state,
    ...DEFAULT_EXISTING_REQUEST_STATE,
  };
};

const handleChangeCompoundValueAction = (
  state: ConfirmCompoundState,
  { payload }: ConfirmCompoundChangeCompoundValueAction,
): ConfirmCompoundState => {
  const _accountMinimum = parseFloat(payload.accountMinimum) / 10 ** payload.decimals;
  let isReadySubmit: boolean;
  let warningMessage: string = '';

  if (_accountMinimum > TURING_ED) {
    isReadySubmit = true;
  } else {
    isReadySubmit = false;
    warningMessage = `${i18n.warningMessage.thresholdLagerThan} ${TURING_ED}`;
  }
  return {
    ...state,
    accountMinimum: payload.accountMinimum,
    isReadySubmit: isReadySubmit,
    warningMessage: warningMessage,
  };
};

export const confirmCompoundReducer = (
  state: ConfirmCompoundState,
  action: ConfirmCompoundAction,
): ConfirmCompoundState => {
  const { type } = action;
  switch (type) {
    case ConfirmCompoundActionName.CHANGE_DELEGATIONS:
      return handleChangeDelegationsAction(state, action);
    case ConfirmCompoundActionName.REFRESH_DELEGATIONS:
      return handleRefreshDelegationsAction(state);
    case ConfirmCompoundActionName.SELECT_DELEGATION:
      return handleSelectDelegationAction(state, action);
    case ConfirmCompoundActionName.REFRESH_EXISTING_REQUEST:
      return handleRefreshExistingRequestAction(state);
    case ConfirmCompoundActionName.CHANGE_EXISTING_REQUEST:
      return handleChangeExistingRequestAction(state, action);
    case ConfirmCompoundActionName.CHANGE_COMPOUND_VALUE:
      return handleChangeCompoundValueAction(state, action);
    default:
      throw new Error();
  }
};
