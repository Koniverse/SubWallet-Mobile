export type PopupFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'every_time' | null; //TODO: update later

export type OnlineContentDataType = 'popup' | 'banner' | 'confirmation'; //TODO: update later

export interface MktCampaignHistoryData {
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
