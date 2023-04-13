import { InfoItemBase } from 'components/MetaInfo/types';
import React from 'react';
import { CheckCircle, IconProps, ListChecks, XCircle } from 'phosphor-react-native';

export type StakingStatusType = 'active' | 'inactive' | 'partialEarning' | 'waiting';

interface StakingStatusUiProps {
  schema: InfoItemBase['valueColorSchema'];
  icon: React.ElementType<IconProps>;
  name: string;
}

export const StakingStatusUi: Record<StakingStatusType, StakingStatusUiProps> = {
  active: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: 'Earning reward',
  },
  partialEarning: {
    schema: 'warning' as InfoItemBase['valueColorSchema'],
    icon: ListChecks,
    name: 'Earning reward',
  },
  inactive: {
    schema: 'danger' as InfoItemBase['valueColorSchema'],
    icon: XCircle,
    name: 'Not earning',
  },
  waiting: {
    schema: 'success' as InfoItemBase['valueColorSchema'],
    icon: CheckCircle,
    name: 'Waiting',
  },
};
