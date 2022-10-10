import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
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
  const navigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    navigation.replace('Home', {
      screen: 'Staking',
      params: {
        screen: 'StakingBalances',
      },
    });
  }, [navigation]);

  const handleReStake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
