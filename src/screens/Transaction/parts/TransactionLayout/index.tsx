import React from 'react';
import TransactionHeader from 'screens/Transaction/parts/TransactionHeader';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { TransactionContainer } from 'components/TransactionContainer.tsx';

interface Props {
  title: string;
  showRightHeaderButton?: boolean;
  disableRightButton?: boolean;
  disableLeftButton?: boolean;
  disableMainHeader?: boolean;
  onPressRightHeaderBtn?: () => void;
  children: React.ReactNode;
  onPressBack?: () => void;
}

export const TransactionLayout = ({
  title,
  showRightHeaderButton = false,
  onPressRightHeaderBtn,
  children,
  disableLeftButton,
  disableRightButton,
  disableMainHeader,
  onPressBack,
}: Props) => {
  const navigation = useNavigation<StakingScreenNavigationProps>();

  return (
    <TransactionContainer>
      <>
        <TransactionHeader
          title={title}
          navigation={navigation}
          showRightIcon={showRightHeaderButton}
          onPressRightIcon={onPressRightHeaderBtn}
          disableRightButton={disableRightButton}
          disableLeftButton={disableLeftButton}
          disableMainHeader={disableMainHeader}
          onPressBack={onPressBack}
        />

        {children}
      </>
    </TransactionContainer>
  );
};
