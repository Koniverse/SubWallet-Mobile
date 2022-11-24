import TransactionResult from 'components/TransactionResult/TransactionResult';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback } from 'react';
import { CompoundResultProps } from 'routes/staking/compoundAction';
import i18n from 'utils/i18n/i18n';

const CreateCompoundResult = ({
  route: {
    params: {
      compoundParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
  navigation: navigation,
}: CompoundResultProps) => {
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
        title: i18n.compoundStakeAction.compound.success.title,
        subText: i18n.compoundStakeAction.compound.success.subText,
      }}
      fail={{
        title: i18n.compoundStakeAction.compound.fail.title,
        subText: i18n.compoundStakeAction.compound.fail.subText,
      }}
      handleResend={goBack}
    />
  );
};

export default React.memo(CreateCompoundResult);
