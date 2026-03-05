import React from 'react';
import TransactionHeader from 'screens/Transaction/parts/TransactionHeader';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { TransactionContainer } from 'components/TransactionContainer';

interface Props {
  title: string;
  showRightHeaderButton?: boolean;
  disableRightButton?: boolean;
  disableLeftButton?: boolean;
  disableMainHeader?: boolean;
  onPressRightHeaderBtn?: () => void;
  children: React.ReactNode;
  onPressBack?: () => void;
  showMainHeader?: boolean;
  titleTextAlign?: 'left' | 'center';
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
  showMainHeader,
  titleTextAlign,
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
          showMainHeader={showMainHeader}
          titleTextAlign={titleTextAlign}
        />

        {children}
      </>
    </TransactionContainer>
  );
};
