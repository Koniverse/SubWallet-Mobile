import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
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
  const navigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    navigation.replace('Home', { tab: 'Staking' });
  }, [navigation]);

  const handleReStake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
