import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import React from 'react';
import { WithdrawResultProps } from 'routes/staking/withdrawAction';
import i18n from 'utils/i18n/i18n';

const WithdrawResult = ({
  route: {
    params: {
      withdrawParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: { goBack },
}: WithdrawResultProps) => {
  const goHome = useGoHome({
    screen: 'Staking',
    params: {
      screen: 'StakingBalances',
    },
  });

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
      handleResend={goBack}
    />
  );
};

export default React.memo(WithdrawResult);
