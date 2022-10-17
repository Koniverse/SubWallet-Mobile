import { EmptyList } from 'components/EmptyList';
import { Trophy } from 'phosphor-react-native';
import React from 'react';
import i18n from 'utils/i18n/i18n';

interface Props {
  message?: string;
}

const EmptyStaking = ({ message = i18n.stakingScreen.balanceList.stakingAppearHere }: Props) => {
  return <EmptyList title={message} icon={Trophy} />;
};

export default React.memo(EmptyStaking);
