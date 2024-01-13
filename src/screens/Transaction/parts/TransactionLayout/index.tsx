import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { ScreenContainer } from 'components/ScreenContainer';
import TransactionHeader from 'screens/Transaction/parts/TransactionHeader';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScreenContainer backgroundColor={'#0C0C0C'}>
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
          <SafeAreaView />
        </>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
