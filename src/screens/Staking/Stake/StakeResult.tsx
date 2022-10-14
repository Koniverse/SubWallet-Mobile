import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import usePreventNavigatorGoBack from 'hooks/usePreventNavigatorGoBack';
import React, { useCallback } from 'react';
import { StakeResultProps } from 'routes/staking/stakeAction';
import i18n from 'utils/i18n/i18n';

const StakeResult = ({
  route: {
    params: {
      stakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: navigation,
}: StakeResultProps) => {
  usePreventNavigatorGoBack();

  const goHome = useGoHome({
    screen: 'Staking',
    params: {
      screen: 'StakingBalances',
    },
  });

  const goBack = useCallback(() => {
    navigation.navigate('StakeConfirm', stakeParams);
  }, [navigation, stakeParams]);

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
      handleResend={goBack}
    />
  );
};

export default React.memo(StakeResult);
