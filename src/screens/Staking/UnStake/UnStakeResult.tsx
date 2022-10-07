import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { UnStakeResultProps } from 'routes/staking/unStakeAction';
import i18n from 'utils/i18n/i18n';

const UnStakeResult = ({
  route: {
    params: {
      unStakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: UnStakeResultProps) => {
  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleReStake = useCallback(() => {
    rootNavigation.navigate('UnStakeAction', {
      screen: 'UnStakeConfirm',
      params: unStakeParams,
    });
  }, [rootNavigation, unStakeParams]);

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
      handleResend={handleReStake}
    />
  );
};

export default React.memo(UnStakeResult);
