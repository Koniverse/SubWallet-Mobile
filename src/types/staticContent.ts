export type PopupFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'every_time'; //TODO: update later

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

export interface AppPopupCondition {
  'condition-balance': { comparison: string; value: number; chain_asset: string }[];
  'condition-earning': { comparison: string; value: number; pool_slug: string }[];
}

export interface PositionParam {
  property: string;
  value: string;
}

export interface AppPopupData {
  id: number;
  priority: number;
  position: string;
  repeat: PopupFrequency;
  content: string;
  media: string;
  position_params: PositionParam[];
  info: AppBasicInfoData;
  buttons: AppContentButton[];
  conditions: AppPopupCondition;
}

export interface AppBannerData {
  id: number;
  position: string;
  priority: number;
  media: string;
  position_params: PositionParam[];
  info: AppBasicInfoData;
  action: AppContentButtonAction;
  conditions: AppPopupCondition;
  instruction: AppContentButtonInstruction | null;
}

export interface AppConfirmationData {
  id: number;
  name: string;
  position: string;
  repeat: PopupFrequency;
  confirm_label: string;
  cancel_label: string;
  content: string;
  position_params: PositionParam[];
  conditions: AppPopupCondition;
}
