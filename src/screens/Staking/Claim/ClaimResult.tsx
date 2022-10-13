import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import usePreventNavigatorGoBack from 'hooks/usePreventNavigatorGoBack';
import React, { useCallback } from 'react';
import { ClaimResultProps } from 'routes/staking/claimAction';
import i18n from 'utils/i18n/i18n';

const ClaimResult = ({
  route: {
    params: {
      claimParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation,
}: ClaimResultProps) => {
  usePreventNavigatorGoBack();
  const goHome = useGoHome({
    screen: 'Staking',
    params: {
      screen: 'StakingBalances',
    },
  });

  const goBack = useCallback(() => {
    navigation.navigate('ClaimAuth', claimParams);
  }, [claimParams, navigation]);

  return (
    <TransactionResult
      isTxSuccess={txSuccess}
      txError={txError}
      networkKey={claimParams.networkKey}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.claimStakeAction.success.title,
        subText: i18n.claimStakeAction.success.subText,
      }}
      fail={{
        title: i18n.claimStakeAction.fail.title,
        subText: i18n.claimStakeAction.fail.subText,
      }}
      handleResend={goBack}
    />
  );
};

export default React.memo(ClaimResult);
