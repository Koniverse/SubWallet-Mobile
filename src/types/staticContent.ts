export type PopupFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'every_time' | null; //TODO: update later

export type OnlineContentDataType = 'popup' | 'banner' | 'confirmation'; //TODO: update later

export interface PopupHistoryData {
  lastShowTime: number;
  showTimes: number;
}

export interface AppBasicInfoData {
  id: number;
  name: string;
  description: string | null;
  start_time: string;
  stop_time: string;
  platforms: string[];
  os: 'android' | 'ios';
  is_changelog_popup?: boolean;
}

export interface AppContentButtonInstruction {
  id: number;
  confirm_label: string;
  cancel_label: string;
  instruction_id: number;
  group: string;
  slug: string;
}

export interface AppContentButtonAction {
  id: number;
  url: string;
  screen: string;
  params: string | null;
  is_cancel: boolean;
}

export interface AppContentButton {
  id: number;
  label: string;
  color: 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';
  instruction: AppContentButtonInstruction | null;
  action: AppContentButtonAction | null;
}

export type ConditionBalanceType = { comparison: string; value: number; chain_asset: string };
export type ConditionEarningType = { comparison: string; value: number; pool_slug: string };
export type ConditionNftType = { chain: string; collection_id: string };
export type ConditionCrowdloanType = { chain: string };
export type ConditionHasMoneyType = { has_money: string[] };

export interface AppPopupCondition {
  'condition-balance': ConditionBalanceType[];
  'condition-earning': ConditionEarningType[];
  'condition-nft': ConditionNftType[];
  'condition-crowdloan': ConditionCrowdloanType[];
  'condition-has-money': ConditionHasMoneyType[];
}

export interface PositionParam {
  property: string;
  value: string;
}

export interface AppCommonData {
  id: number;
  position: string;
  position_params: PositionParam[];
  conditions: AppPopupCondition;
}

export interface AppPopupData extends AppCommonData {
  priority: number;
  repeat: PopupFrequency;
  content: string;
  media: string;
  info: AppBasicInfoData;
  buttons: AppContentButton[];
  repeat_every_x_days: number | null;
  locations?: string[];
}

export interface AppBannerData extends AppCommonData {
  priority: number;
  media: string;
  info: AppBasicInfoData;
  action: AppContentButtonAction;
  instruction: AppContentButtonInstruction | null;
  locations?: string[];
}

export interface AppConfirmationData extends AppCommonData {
  name: string;
  repeat: PopupFrequency;
  confirm_label: string;
  cancel_label: string;
  content: string;
  repeat_every_x_days: number | null;
}
