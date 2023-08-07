import { InfoItemBase } from 'components/MetaInfo/types';
import React from 'react';
import { CheckCircle, IconProps, ListChecks, XCircle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

export type StakingStatusType = 'active' | 'inactive' | 'partialEarning' | 'waiting';

interface StakingStatusUiProps {
  schema: InfoItemBase['valueColorSchema'];
  icon: React.ElementType<IconProps>;
  name: string;
}

export const StakingStatusUi = (): Record<StakingStatusType, StakingStatusUiProps> => ({
  active: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: i18n.stakingScreen.earningReward,
  },
  partialEarning: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: i18n.stakingScreen.earningReward,
  },
  inactive: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: i18n.stakingScreen.notEarning,
  },
  waiting: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: i18n.inputLabel.waiting,
  },
});
