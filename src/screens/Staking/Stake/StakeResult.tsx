import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { StakeResultProps } from 'routes/staking/stakeAction';
import i18n from 'utils/i18n/i18n';

const StakeResult = ({
  route: {
    params: {
      stakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: StakeResultProps) => {
  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleReStake = useCallback(() => {
    rootNavigation.navigate('StakeAction', {
      screen: 'StakeConfirm',
      params: stakeParams,
    });
  }, [rootNavigation, stakeParams]);

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
