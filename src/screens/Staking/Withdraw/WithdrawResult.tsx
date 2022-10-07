import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { WithdrawResultProps } from 'routes/staking/withdrawAction';
import i18n from 'utils/i18n/i18n';

const WithdrawResult = ({
  route: {
    params: {
      withdrawParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: WithdrawResultProps) => {
  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleReStake = useCallback(() => {
    rootNavigation.navigate('WithdrawStakeAction', {
      screen: 'WithdrawAuth',
      params: withdrawParams,
    });
  }, [rootNavigation, withdrawParams]);

  return (
    <TransactionResult
      isTxSuccess={txSuccess}
      txError={txError}
      networkKey={withdrawParams.networkKey}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.withdrawStakeAction.success.title,
        subText: i18n.withdrawStakeAction.success.subText,
      }}
      fail={{
        title: i18n.withdrawStakeAction.fail.title,
        subText: i18n.withdrawStakeAction.fail.subText,
      }}
      handleResend={handleReStake}
    />
  );
};

export default React.memo(WithdrawResult);
