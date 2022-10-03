import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { StakeActionNavigationProps, StakeResultProps } from 'routes/staking/stakeAction';
import i18n from 'utils/i18n/i18n';

const StakeResult = ({
  route: {
    params: { stakeParams, txError, txSuccess, extrinsicHash },
  },
}: StakeResultProps) => {
  const homeNavigation = useNavigation<HomeNavigationProps>();
  const stakeActionNavigation = useNavigation<StakeActionNavigationProps>();

  const goHome = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleReStake = useCallback(() => {
    stakeActionNavigation.navigate('StakeConfirm', stakeParams);
  }, [stakeActionNavigation, stakeParams]);

  return (
    <TransactionResult
      isTxSuccess={txSuccess}
      txError={txError}
      networkKey={stakeParams.networkKey}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.stakeAction.success.title,
        subText: i18n.stakeAction.success.subText,
      }}
      fail={{
        title: i18n.stakeAction.fail.title,
        subText: i18n.stakeAction.fail.subText,
      }}
      handleResend={handleReStake}
    />
  );
};

export default React.memo(StakeResult);
