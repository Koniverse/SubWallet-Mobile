import { InfoItemBase } from 'components/MetaInfo/types';
import { CheckCircleIcon, ListChecksIcon, XCircleIcon } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { EarningStatusUiProps, NominationPoolState } from 'types/earning';
import { EarningStatus } from '@subwallet/extension-base/types';

export type StakingStatusType = 'active' | 'inactive' | 'partialEarning' | 'waiting';

export const EarningStatusUi: Record<EarningStatus, EarningStatusUiProps> = {
  [EarningStatus.EARNING_REWARD]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircleIcon,
    name: i18n.stakingScreen.earningReward,
  },
  [EarningStatus.PARTIALLY_EARNING]: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecksIcon,
    name: i18n.stakingScreen.earningReward,
  },
  [EarningStatus.NOT_EARNING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircleIcon,
    name: i18n.stakingScreen.notEarning,
  },
  [EarningStatus.WAITING]: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircleIcon,
    name: i18n.inputLabel.waiting,
  },
  [EarningStatus.NOT_STAKING]: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircleIcon,
    name: i18n.stakingScreen.notEarning,
  },
};

export const NominationPoolsEarningStatusUi: Record<NominationPoolState['state'], EarningStatusUiProps> = {
  Open: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircleIcon,
    name: 'Open',
  },
  Locked: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircleIcon,
    name: 'Locked',
  },
  Destroying: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecksIcon,
    name: 'Destroying',
  },
  Blocked: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircleIcon,
    name: 'Blocked',
  },
};
