import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import React from 'react';
import { UnStakeResultProps } from 'routes/staking/unStakeAction';
import i18n from 'utils/i18n/i18n';

const UnStakeResult = ({
  route: {
    params: {
      unStakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: { goBack },
}: UnStakeResultProps) => {
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
      networkKey={unStakeParams.networkKey}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.unStakeAction.success.title,
        subText: i18n.unStakeAction.success.subText,
      }}
      fail={{
        title: i18n.unStakeAction.fail.title,
        subText: i18n.unStakeAction.fail.subText,
      }}
      handleResend={goBack}
    />
  );
};

export default React.memo(UnStakeResult);
