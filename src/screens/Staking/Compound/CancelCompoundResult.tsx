import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback } from 'react';
import { CancelCompoundResultProps } from 'routes/staking/compoundAction';
import i18n from 'utils/i18n/i18n';

const CancelCompoundResult = ({
  route: {
    params: {
      compoundParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: navigation,
}: CancelCompoundResultProps) => {
  useHandlerHardwareBackPress(true);

  const goHome = useGoHome({
    screen: 'Staking',
    params: {
      screen: 'StakingBalances',
    },
  });

  const goBack = useCallback(() => {
    navigation.navigate('CompoundConfirm', compoundParams);
  }, [navigation, compoundParams]);

  return (
    <TransactionResult
      isTxSuccess={txSuccess}
      txError={txError}
      networkKey={compoundParams.networkKey}
      extrinsicHash={extrinsicHash}
      backToHome={goHome}
      success={{
        title: i18n.compoundStakeAction.cancelCompound.success.title,
        subText: i18n.compoundStakeAction.cancelCompound.success.subText,
      }}
      fail={{
        title: i18n.compoundStakeAction.cancelCompound.fail.title,
        subText: i18n.compoundStakeAction.cancelCompound.fail.subText,
      }}
      handleResend={goBack}
    />
  );
};

export default React.memo(CancelCompoundResult);
