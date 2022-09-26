import { EmptyList } from 'components/EmptyList';
import { Trophy } from 'phosphor-react-native';
import React from 'react';
import i18n from 'utils/i18n/i18n';

const EmptyStaking = () => {
  return <EmptyList title={i18n.stakingScreen.stakingAnyChain} icon={Trophy} />;
};

export default EmptyStaking;
