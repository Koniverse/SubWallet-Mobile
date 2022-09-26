import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

export type StakingScreenName = 'StakingList' | 'StakingDetail' | 'NetworkList' | 'ValidatorList';
export type ValidatorSortBy = 'Default' | 'Commission' | 'Return';

export interface StakingScreenState {
  title: string;
  screen: StakingScreenName;
  stakingKey?: string;
  selectedNetwork?: string;
  validatorSortBy: ValidatorSortBy;
  selectedValidator?: ValidatorInfo;
}

export enum StakingScreenActionType {
  INIT = 'INIT',
  GO_BACK = 'GO_BACK',
  OPEN_STAKING_LIST = 'OPEN_STAKING_LIST',
  OPEN_STAKING_DETAIL = 'OPEN_STAKING_DETAIL',
  START_STAKING = 'START_STAKING',
  OPEN_VALIDATOR_LIST = 'OPEN_VALIDATOR_LIST',
}

export interface AbstractStakingScreenActionParams {
  type: StakingScreenActionType;
  payload: Partial<StakingScreenState> | null;
}

export interface StakingScreenInitAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.INIT;
  payload: Partial<StakingScreenState>;
}

export interface StakingScreenOpenStakingListAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.OPEN_STAKING_LIST;
  payload: null;
}

export interface StakingScreenOpenStakingDetailAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.OPEN_STAKING_DETAIL;
  payload: {
    stakingKey: string;
    title?: string;
  };
}

export interface StakingScreenStartStakingAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.START_STAKING;
  payload: {
    selectedNetwork: string;
    title?: string;
  } | null;
}

export interface StakingScreenOpenValidatorListAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.OPEN_VALIDATOR_LIST;
  payload: {
    selectedNetwork: string;
    title?: string;
  };
}

export interface StakingScreenGoBackAction extends AbstractStakingScreenActionParams {
  type: StakingScreenActionType.GO_BACK;
  payload: null;
}

export type StakingScreenActionParams =
  | StakingScreenInitAction
  | StakingScreenOpenStakingListAction
  | StakingScreenOpenStakingDetailAction
  | StakingScreenStartStakingAction
  | StakingScreenOpenValidatorListAction
  | StakingScreenGoBackAction;

export const STAKING_INITIAL_STATE: StakingScreenState = {
  screen: 'StakingList',
  title: i18n.title.staking,
  stakingKey: undefined,
  selectedNetwork: undefined,
  validatorSortBy: 'Default',
};

const handleInitAction = (action: StakingScreenInitAction): StakingScreenState => {
  const { payload } = action;
  return { ...STAKING_INITIAL_STATE, ...payload };
};

const handleOpenStakingListAction = (): StakingScreenState => {
  return {
    screen: 'StakingList',
    title: i18n.title.staking,
    stakingKey: undefined,
    selectedNetwork: undefined,
    validatorSortBy: 'Default',
  };
};

const handleOpenStakingDetail = ({ payload }: StakingScreenOpenStakingDetailAction): StakingScreenState => {
  return {
    screen: 'StakingDetail',
    stakingKey: payload.stakingKey,
    title: payload.title || i18n.title.stakingDetail,
    selectedNetwork: undefined,
    validatorSortBy: 'Default',
  };
};

const handleStartStaking = (
  state: StakingScreenState,
  { payload }: StakingScreenStartStakingAction,
): StakingScreenState => {
  if (payload) {
    return {
      ...state,
      screen: 'ValidatorList',
      title: payload.title || i18n.title.validators,
      selectedNetwork: payload.selectedNetwork,
      validatorSortBy: 'Default',
    };
  } else {
    return {
      ...state,
      screen: 'NetworkList',
      title: i18n.title.stakingNetwork,
      selectedNetwork: undefined,
      validatorSortBy: 'Default',
    };
  }
};

const handleOpenValidatorList = (
  state: StakingScreenState,
  { payload }: StakingScreenOpenValidatorListAction,
): StakingScreenState => {
  return {
    ...state,
    screen: 'ValidatorList',
    title: payload.title || i18n.title.validators,
    selectedNetwork: payload.selectedNetwork,
  };
};

const handleGoBackAction = (state: StakingScreenState): StakingScreenState => {
  const { screen, stakingKey } = state;
  switch (screen) {
    case 'ValidatorList':
      return {
        ...state,
        screen: 'NetworkList',
        title: i18n.title.stakingNetwork,
        stakingKey: undefined,
        selectedNetwork: undefined,
        validatorSortBy: 'Default',
      };
    case 'NetworkList':
      if (stakingKey) {
        return {
          ...state,
          screen: 'StakingDetail',
          title: i18n.title.stakingDetail,
          selectedNetwork: undefined,
          validatorSortBy: 'Default',
        };
      }
      return {
        ...state,
        screen: 'StakingList',
        title: i18n.title.staking,
        stakingKey: undefined,
        selectedNetwork: undefined,
        validatorSortBy: 'Default',
      };
  }
  return {
    ...state,
    screen: 'StakingList',
    title: i18n.title.staking,
    stakingKey: undefined,
    selectedNetwork: undefined,
    validatorSortBy: 'Default',
  };
};

export const stakingReducer = (state: StakingScreenState, action: StakingScreenActionParams): StakingScreenState => {
  const { type } = action;
  switch (type) {
    case StakingScreenActionType.INIT:
      return handleInitAction(action);
    case StakingScreenActionType.OPEN_STAKING_LIST:
      return handleOpenStakingListAction();
    case StakingScreenActionType.START_STAKING:
      return handleStartStaking(state, action);
    case StakingScreenActionType.GO_BACK:
      return handleGoBackAction(state);
    case StakingScreenActionType.OPEN_STAKING_DETAIL:
      return handleOpenStakingDetail(action);
    case StakingScreenActionType.OPEN_VALIDATOR_LIST:
      return handleOpenValidatorList(state, action);
    default:
      throw new Error();
  }
};
