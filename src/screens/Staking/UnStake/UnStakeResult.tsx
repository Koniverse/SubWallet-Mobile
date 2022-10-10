import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { RootNavigationProps } from 'routes/index';
import { UnStakeResultProps } from 'routes/staking/unStakeAction';
import i18n from 'utils/i18n/i18n';
import useGoHome from 'hooks/screen/useGoHome';

const UnStakeResult = ({
  route: {
    params: {
      unStakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: UnStakeResultProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome('Staking');

  const handleReStake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
