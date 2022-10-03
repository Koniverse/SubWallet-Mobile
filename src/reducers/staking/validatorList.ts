import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { NetworkValidatorsInfo, ValidatorSortBy } from 'types/staking';
import { SortFunctionInterface } from 'types/ui-types';

export interface ValidatorListState {
  networkValidatorsInfo: NetworkValidatorsInfo;
  validators: ValidatorInfo[];
  visible: boolean;
  sortBy: ValidatorSortBy;
  loading: boolean;
  sortFunction: SortFunctionInterface<ValidatorInfo>;
}

export enum ValidatorListActionName {
  INIT = 'INIT',
  CHANGE_LOADING = 'CHANGE_LOADING',
  CHANGE_VISIBLE = 'CHANGE_VISIBLE',
  CHANGE_SORT_BY = 'CHANGE_SORT_BY',
}

interface AbstractValidatorListAction {
  type: ValidatorListActionName;
  payload: Partial<ValidatorListState> | null;
}

interface ValidatorListInitAction extends AbstractValidatorListAction {
  type: ValidatorListActionName.INIT;
  payload: Partial<ValidatorListState> | null;
}

interface ValidatorListChangeLoadingAction extends AbstractValidatorListAction {
  type: ValidatorListActionName.CHANGE_LOADING;
  payload: { loading: boolean };
}

interface ValidatorListChangeVisibleAction extends AbstractValidatorListAction {
  type: ValidatorListActionName.CHANGE_VISIBLE;
  payload: { visible: boolean };
}

interface ValidatorListChangeSortByAction extends AbstractValidatorListAction {
  type: ValidatorListActionName.CHANGE_SORT_BY;
  payload: { sortBy: ValidatorSortBy };
}

export type ValidatorListActionParams =
  | ValidatorListInitAction
  | ValidatorListChangeLoadingAction
  | ValidatorListChangeVisibleAction
  | ValidatorListChangeSortByAction;

const sortByDefaultFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.isVerified && !_validator.isVerified) {
    return -1;
  } else if (!validator.isVerified && _validator.isVerified) {
    return 1;
  }

  return 0;
};

const sortByReturnedFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.expectedReturn > _validator.expectedReturn) {
    return -1;
  } else if (validator.expectedReturn <= _validator.expectedReturn) {
    return 1;
  }

  return 0;
};

const sortByCommissionFunc = (validator: ValidatorInfo, _validator: ValidatorInfo): number => {
  if (validator.commission <= _validator.commission) {
    return -1;
  } else if (validator.commission > _validator.commission) {
    return 1;
  }

  return 0;
};

const getSortFunction = (sortBy: ValidatorSortBy): SortFunctionInterface<ValidatorInfo> => {
  switch (sortBy) {
    case 'Return':
      return sortByReturnedFunc;
    case 'Commission':
      return sortByCommissionFunc;
    case 'Default':
    default:
      return sortByDefaultFunc;
  }
};

export const DEFAULT_VALIDATOR_LIST_STATE: ValidatorListState = {
  networkValidatorsInfo: {
    bondedValidators: [],
    isBondedBefore: false,
    maxNominatorPerValidator: 0,
    maxNominations: 0,
  },
  sortBy: 'Default',
  validators: [],
  visible: false,
  loading: true,
  sortFunction: sortByDefaultFunc,
};

const handleInitAction = ({ payload }: ValidatorListInitAction): ValidatorListState => {
  const result = {
    ...DEFAULT_VALIDATOR_LIST_STATE,
    ...payload,
  };
  result.sortFunction = getSortFunction(result.sortBy);
  return result;
};

const handleChangeLoadingAction = (
  state: ValidatorListState,
  { payload }: ValidatorListChangeLoadingAction,
): ValidatorListState => {
  return {
    ...state,
    loading: payload.loading,
  };
};

const handleChangeVisibleAction = (
  state: ValidatorListState,
  { payload }: ValidatorListChangeVisibleAction,
): ValidatorListState => {
  return {
    ...state,
    visible: payload.visible,
  };
};

const handleChangeSortByAction = (
  state: ValidatorListState,
  { payload }: ValidatorListChangeSortByAction,
): ValidatorListState => {
  state.visible = false;
  const sortFunc = getSortFunction(payload.sortBy);
  return {
    ...state,
    sortBy: payload.sortBy,
    sortFunction: sortFunc,
  };
};

export const validatorListReducer = (
  state: ValidatorListState,
  action: ValidatorListActionParams,
): ValidatorListState => {
  const { type } = action;
  switch (type) {
    case ValidatorListActionName.INIT:
      return handleInitAction(action);
    case ValidatorListActionName.CHANGE_LOADING:
      return handleChangeLoadingAction(state, action);
    case ValidatorListActionName.CHANGE_VISIBLE:
      return handleChangeVisibleAction(state, action);
    case ValidatorListActionName.CHANGE_SORT_BY:
      return handleChangeSortByAction(state, action);
    default:
      throw new Error();
  }
};
