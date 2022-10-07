import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { ClaimResultProps } from 'routes/staking/claimAction';
import i18n from 'utils/i18n/i18n';

const ClaimResult = ({
  route: {
    params: {
      claimParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: ClaimResultProps) => {
  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleReStake = useCallback(() => {
    rootNavigation.navigate('ClaimStakeAction', {
      screen: 'ClaimAuth',
      params: claimParams,
    });
  }, [claimParams, rootNavigation]);

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
      handleResend={handleReStake}
    />
  );
};

export default React.memo(ClaimResult);
