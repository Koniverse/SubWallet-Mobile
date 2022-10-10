import { useNavigation } from '@react-navigation/native';
import TransactionResult from 'components/TransactionResult/TransactionResult';
import React, { useCallback } from 'react';
import { RootNavigationProps } from 'routes/index';
import { StakeResultProps } from 'routes/staking/stakeAction';
import i18n from 'utils/i18n/i18n';

const StakeResult = ({
  route: {
    params: {
      stakeParams,
      txParams: { txError, txSuccess, extrinsicHash },
    },
  },
}: StakeResultProps) => {
  const navigation = useNavigation<RootNavigationProps>();

  const goHome = useCallback(() => {
    navigation.replace('Home', {
      screen: 'Staking',
      params: {
        screen: 'StakingBalances',
      },
    });
  }, [navigation]);

  const handleReStake = useCallback(() => {
    navigation.navigate('StakeAction', {
      screen: 'StakeConfirm',
      params: stakeParams,
    });
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
      handleResend={handleReStake}
    />
  );
};

export default React.memo(StakeResult);
